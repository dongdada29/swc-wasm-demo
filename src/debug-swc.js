// Simple SWC WASM debug script
console.log('🔍 [DEBUG] Starting SWC WASM debug...')

// Test basic import
try {
  const initSwc = await import('@swc/wasm-web')
  console.log('✅ [DEBUG] Import successful')
  console.log('📦 [DEBUG] Module exports:', Object.keys(initSwc))
} catch (error) {
  console.error('❌ [DEBUG] Import failed:', error)
}

// Test initialization
try {
  const { default: init } = await import('@swc/wasm-web')
  const swc = await init()
  console.log('✅ [DEBUG] Initialization successful')
  console.log('🔧 [DEBUG] SWC instance type:', typeof swc)
  console.log('🔧 [DEBUG] SWC methods:', Object.getOwnPropertyNames(swc.__proto__).filter(name => typeof swc[name] === 'function'))
} catch (error) {
  console.error('❌ [DEBUG] Initialization failed:', error)
}

// Test simple transform
try {
  const { default: init, transform } = await import('@swc/wasm-web')
  await init()

  const simpleCode = 'const x = 1'
  const result = await transform(simpleCode, {
    jsc: {
      target: 'es2022',
      parser: {
        syntax: 'ecmascript'
      }
    }
  })

  console.log('✅ [DEBUG] Simple transform successful')
  console.log('📝 [DEBUG] Result:', result)
} catch (error) {
  console.error('❌ [DEBUG] Simple transform failed:', error)
}

// Test TypeScript transform
try {
  const { default: init, transform } = await import('@swc/wasm-web')
  await init()

  const tsCode = `
    interface Test {
      value: string
    }
    const test: Test = { value: 'hello' }
    console.log(test.value)
  `

  const result = await transform(tsCode, {
    jsc: {
      target: 'es2022',
      parser: {
        syntax: 'typescript'
      }
    },
    module: {
      type: 'es6'
    }
  })

  console.log('✅ [DEBUG] TypeScript transform successful')
  console.log('📝 [DEBUG] Result length:', result.code?.length || 0)
} catch (error) {
  console.error('❌ [DEBUG] TypeScript transform failed:', error)
}

// Test JSX transform
try {
  const { default: init, transform } = await import('@swc/wasm-web')
  await init()

  const jsxCode = `
    const App = () => {
      return <div>Hello World</div>
    }
    export default App
  `

  const result = await transform(jsxCode, {
    jsc: {
      target: 'es2022',
      parser: {
        syntax: 'typescript',
        tsx: true,
        jsx: true
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
  })

  console.log('✅ [DEBUG] JSX transform successful')
  console.log('📝 [DEBUG] Result:', result.code?.substring(0, 100) + '...')
} catch (error) {
  console.error('❌ [DEBUG] JSX transform failed:', error)
  console.error('❌ [DEBUG] Error details:', error?.message)
  console.error('❌ [DEBUG] Error stack:', error?.stack)
}

console.log('🔍 [DEBUG] Debug complete')