import React from 'react';
import { Button } from 'animal-island-ui';
import 'animal-island-ui/style'

const App = () => {
    return (
        <div>
            {/* Primary */}
            <Button type="primary">Primary</Button>
            {/* Default */}
            <Button>Default</Button>
            {/* Dashed */}
            <Button type="dashed">Dashed</Button>
            {/* Text */}
            <Button type="text">Text</Button>
            {/* Link */}
            <Button type="link">Link</Button>
            {/* Danger */}
            <Button type="primary" danger>Danger</Button>
            {/* Ghost */}
            <Button type="primary" ghost>Ghost</Button>
            {/* Loading */}
            <Button type="primary" loading>Loading</Button>
            {/* Large */}
            <Button type="primary" size="large">Large</Button>
            {/* Icon */}
            <Button type="primary" icon={<span>🔍</span>}>搜索</Button>
            {/* Block */}
            <Button type="primary" block>Block</Button>
        </div>
    );
};

export default App;