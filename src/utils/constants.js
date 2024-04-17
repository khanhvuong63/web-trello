let apiRoot = ''

console.log('import.meta.env', import.meta.env)
console.log('process.env', process.env)
if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:8017'
  console.log('🚀 ~ apiRoot:', apiRoot)
}
if (process.env.BUILD_MODE === 'production') {
  apiRoot='https://trello-api-eheo.onrender.com'
}
// export const API_ROOT = 'http://localhost:8017'
//export const API_ROOT = 'https://trello-api-eheo.onrender.com'
export const API_ROOT = apiRoot
