import React from 'react';

interface DescribableProps {
  'aria-describedby'?: string;
}

/**
 * Koppelt extra teksten (description, error, status) aan een form control door
 * `aria-describedby` op het child-element te zetten.
 *
 * Een bestaande `aria-describedby` op de control blijft behouden: de
 * gegenereerde ID's komen eerst, gevolgd door wat de consument zelf meegaf.
 * Dubbele ID's worden verwijderd.
 *
 * Wanneer er geen ID's zijn, of het child geen React-element is (bijvoorbeeld
 * een string of een fragment), blijft de control ongewijzigd.
 */
export function describeControl(
  control: React.ReactNode,
  ids: ReadonlyArray<string | undefined>
): React.ReactNode {
  const generated = ids.filter((id): id is string => Boolean(id));

  if (generated.length === 0 || !React.isValidElement(control)) {
    return control;
  }

  const element = control as React.ReactElement<DescribableProps>;
  const existing = element.props['aria-describedby'];
  const merged = [
    ...generated,
    ...(existing ? existing.split(/\s+/).filter(Boolean) : []),
  ]
    .filter((id, index, all) => all.indexOf(id) === index)
    .join(' ');

  return React.cloneElement(element, { 'aria-describedby': merged });
}
