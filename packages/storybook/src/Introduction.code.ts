// Codevoorbeelden voor Introduction.mdx. Ze staan hier en niet in de MDX,
// omdat Prettier template literals in MDX als markdown herformatteert
// (inspringing weg, lege regels na elke `#`-regel).

export const installCode = `
# Clone de repository
git clone https://github.com/jeffreylauwers/design-system-starter-kit.git

# Installeer dependencies
pnpm install

# Start Storybook lokaal
pnpm run dev
`;

export const usageCode = `
import { Button, Icon } from '@dsn-starter-kit/components-react';

function App() {
  return (
    <Button variant="strong" iconEnd={<Icon name="arrow-right" />}>
      Ga verder
    </Button>
  );
}
`;

export const developmentCode = `
# Build alle packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
`;
