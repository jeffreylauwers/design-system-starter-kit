/**
 * Schrijft dist/figma/variables.json weg als Figma variable collections.
 *
 * Twee passes, om dezelfde reden als in de generator: een alias kan pas gelegd
 * worden als het doel bestaat, en een component-token mag naar een ander
 * component-token verwijzen.
 *
 * De import is idempotent: bestaande collections, modes en variables worden
 * hergebruikt en bijgewerkt in plaats van gedupliceerd. Dat is een harde eis,
 * want anders raken bindingen die designers al gelegd hebben los.
 */

/** Zoekt een bestaande collection op naam, of maakt hem aan. */
async function ensureCollection(name) {
  const existing = await figma.variables.getLocalVariableCollectionsAsync();
  const found = existing.find((collection) => collection.name === name);
  return found ?? figma.variables.createVariableCollection(name);
}

/**
 * Zorgt dat de collection precies de gevraagde modes heeft.
 * De eerste mode bestaat altijd al (Figma maakt hem aan met de collection),
 * dus die wordt hernoemd in plaats van toegevoegd.
 */
function ensureModes(collection, modeNames, log) {
  const modeIds = {};

  modeNames.forEach((modeName, index) => {
    const existing = collection.modes.find((mode) => mode.name === modeName);
    if (existing) {
      modeIds[modeName] = existing.modeId;
      return;
    }

    if (index === 0) {
      collection.renameMode(collection.modes[0].modeId, modeName);
      modeIds[modeName] = collection.modes[0].modeId;
      return;
    }

    try {
      modeIds[modeName] = collection.addMode(modeName);
    } catch (error) {
      // Het mode-maximum hangt af van het Figma-plan.
      log.error(
        `Mode "${modeName}" kon niet worden toegevoegd aan ${collection.name}: ${error.message}`
      );
    }
  });

  return modeIds;
}

/** Zoekt een bestaande variable in de collection, of maakt hem aan. */
function ensureVariable(name, collection, resolvedType, index, log) {
  const existing = index.get(name);
  if (existing) {
    if (existing.resolvedType === resolvedType) return existing;
    // Van type wisselen kan niet; de oude variable moet dan weg.
    log.warn(
      `${name}: type wijzigt van ${existing.resolvedType} naar ${resolvedType}, variable opnieuw aangemaakt`
    );
    existing.remove();
    index.delete(name);
  }

  const created = figma.variables.createVariable(
    name,
    collection,
    resolvedType
  );
  index.set(name, created);
  return created;
}

/**
 * @param {object} payload de inhoud van variables.json
 * @param {object} log verzamelaar met .info/.warn/.error
 */
export async function importVariables(payload, log) {
  if (payload.$schema !== 'dsn-figma-variables/1') {
    throw new Error(
      `Onbekend formaat: ${payload.$schema ?? 'geen $schema'}. Verwacht dsn-figma-variables/1.`
    );
  }

  const state = new Map();

  // ---------------------------------------------------------------------------
  // Pass 1: collections, modes en alle variables met hun letterlijke waarde.
  // ---------------------------------------------------------------------------
  for (const spec of payload.collections) {
    const collection = await ensureCollection(spec.name);
    const modeIds = ensureModes(collection, spec.modes, log);

    const allVariables = await figma.variables.getLocalVariablesAsync();
    const index = new Map(
      allVariables
        .filter((v) => v.variableCollectionId === collection.id)
        .map((v) => [v.name, v])
    );

    const variables = new Map();

    for (const spec2 of spec.variables) {
      const variable = ensureVariable(
        spec2.name,
        collection,
        spec2.type,
        index,
        log
      );
      variables.set(spec2.name, variable);

      if (spec2.description) variable.description = spec2.description;

      // Aliassen komen in pass 2; hier alleen de vaste waarden.
      if (!spec2.valuesByMode) continue;

      for (const [modeName, value] of Object.entries(spec2.valuesByMode)) {
        const modeId = modeIds[modeName];
        if (!modeId) continue;
        try {
          variable.setValueForMode(modeId, value);
        } catch (error) {
          log.error(`${spec2.name} (${modeName}): ${error.message}`);
        }
      }
    }

    state.set(spec.name, { collection, modeIds, variables });
    log.info(
      `${spec.name}: ${spec.variables.length} variables, ${spec.modes.length} modes`
    );
  }

  // ---------------------------------------------------------------------------
  // Pass 2: aliassen. Nu bestaan alle doelen.
  // ---------------------------------------------------------------------------
  let aliasCount = 0;
  let aliasFailed = 0;

  for (const spec of payload.collections) {
    const entry = state.get(spec.name);

    for (const spec2 of spec.variables) {
      if (!spec2.alias) continue;

      const target = state.get(spec2.alias.collection);
      const targetVariable = target && target.variables.get(spec2.alias.name);
      if (!targetVariable) {
        log.error(
          `${spec2.name}: aliasdoel ${spec2.alias.collection} / ${spec2.alias.name} niet gevonden`
        );
        aliasFailed += 1;
        continue;
      }

      const alias = figma.variables.createVariableAlias(targetVariable);
      const variable = entry.variables.get(spec2.name);

      // Een alias geldt voor elke mode van de eigen collection; het doel lost
      // zelf per mode op. Zo blijft de delegatieketen in Figma intact.
      for (const modeId of Object.values(entry.modeIds)) {
        try {
          variable.setValueForMode(modeId, alias);
        } catch (error) {
          log.error(`${spec2.name}: alias mislukt: ${error.message}`);
          aliasFailed += 1;
        }
      }
      aliasCount += 1;
    }
  }

  log.info(
    `${aliasCount} aliassen gelegd${aliasFailed ? `, ${aliasFailed} mislukt` : ''}`
  );
  return { aliasCount, aliasFailed };
}
