import 'dotenv/config';

export default async function dfuseClient(client) {
    const streamTransfer = `subscription($cursor: String!) {
        searchTransactionsForward(query: "receiver:eosio.token action:transfer -data.quantity:'0.0001 EOS'", cursor: $cursor) {
          undo cursor
          trace {
            matchingActions { json }
          }
        }
      }`
    await client.graphql(streamTransfer, (message, stream) => {
        if (message.type === "error") {
            console.log("An error occurred", message.errors, message.terminal)
        }
        
        if (message.type === "data") {
            const data = message.data.searchTransactionsForward
            const actions = data.trace.matchingActions
        
            actions.forEach(({ json }) => {
            const { from, to, quantity, memo } = json
            console.log(`Transfer [${from} -> ${to}, ${quantity}] (${memo})`)
            })
        
            stream.mark({ cursor: data.cursor })
        }
        
        if (message.type === "complete") {
            console.log("Stream completed")
        }
    })
}