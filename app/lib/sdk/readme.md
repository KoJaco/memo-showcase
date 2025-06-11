```jsx
const {
    transcriptFinal,
    drafts,
    functions,
    connect,
    startRecording,
    stopRecording,
} = useMemonic({
    config: {
        apiUrl: "wss://memo.example/ws",
        functionConfig: { updateMs: 800, definitions: myDefs },
    },
});

return (
    <>
        <button onClick={connect}>Connect</button>
        <button onClick={startRecording}>🎙️</button>
        <button onClick={stopRecording}>⏹</button>

        <pre>{transcriptFinal}</pre>
        <pre>Drafts: {JSON.stringify(drafts, null, 2)}</pre>
        <pre>Final: {JSON.stringify(functions, null, 2)}</pre>
    </>
);
```
