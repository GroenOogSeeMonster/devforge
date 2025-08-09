import React from 'react';
import { Group, Button, Text, Stack, Box } from '@mantine/core';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';

export function CodeEditorPage() {
  const [code, setCode] = React.useState<string>(
    "// Welcome to DevForge\n// Start coding here...\nfunction hello() {\n  console.log('Hello DevForge');\n}"
  );

  return (
    <Stack gap="sm" style={{ height: 'calc(100vh - 140px)' }}>
      <Group justify="space-between">
        <Text fw={600}>Editor</Text>
        <Group>
          <Button size="xs" variant="light">Run</Button>
          <Button size="xs" variant="default">Format</Button>
          <Button size="xs" variant="outline">Save</Button>
        </Group>
      </Group>

      <PanelGroup direction="horizontal" style={{ flex: 1, minHeight: 0 }}>
        <Panel defaultSize={20} minSize={15} maxSize={35}>
          <Box style={{ height: '100%', border: '1px solid rgba(128,128,128,0.2)', borderRadius: 6, padding: 8 }}>
            <Text size="sm" fw={500} mb={6}>Explorer</Text>
            <Text size="xs" color="dimmed">Project files will appear here</Text>
          </Box>
        </Panel>
        <PanelResizeHandle style={{ width: 4, cursor: 'col-resize' }} />
        <Panel minSize={30}>
          <Box style={{ height: '100%', border: '1px solid rgba(128,128,128,0.2)', borderRadius: 6, overflow: 'hidden' }}>
            <Editor
              height="100%"
              defaultLanguage="typescript"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </Box>
        </Panel>
        <PanelResizeHandle style={{ width: 4, cursor: 'col-resize' }} />
        <Panel defaultSize={25} minSize={15} maxSize={40}>
          <Box style={{ height: '100%', border: '1px solid rgba(128,128,128,0.2)', borderRadius: 6, padding: 8 }}>
            <Text size="sm" fw={500} mb={6}>Console</Text>
            <Text size="xs" color="dimmed">Runtime output will show here</Text>
          </Box>
        </Panel>
      </PanelGroup>
    </Stack>
  );
}

export default CodeEditorPage;


