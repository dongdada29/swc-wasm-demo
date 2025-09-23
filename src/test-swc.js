import initSwc, { transform } from '@swc/wasm-web'

export async function testSwcCompile() {
  console.log('🧪 [TEST] Starting SWC WASM test...')

  try {
    console.log('🔧 [TEST] Initializing SWC WASM...')
    const swc = await initSwc()
    console.log('✅ [TEST] SWC WASM initialized successfully')

    const testCode = `
      const App = () => {
        return React.createElement('div', null, 'Hello World')
      }
      export default App
    `

    console.log('📝 [TEST] Test code length:', testCode.length)

    const options = {
      jsc: {
        target: 'es2022',
        parser: {
          syntax: 'typescript',
          tsx: true
        },
        transform: {
          react: {
            runtime: 'automatic'
          }
        }
      },
      module: {
        type: 'es6'
      }
    }

    console.log('🔧 [TEST] Starting transformation...')
    const result = await transform(testCode, options)

    console.log('✅ [TEST] Transformation successful')
    console.log('📝 [TEST] Result code length:', result.code?.length || 0)
    console.log('📝 [TEST] Result preview:', result.code?.substring(0, 200))

    return result
  } catch (error) {
    console.error('❌ [TEST] SWC WASM test failed:', error)
    console.error('❌ [TEST] Error stack:', error instanceof Error ? error.stack : 'No stack available')
    throw error
  }
}

export default testSwcCompile