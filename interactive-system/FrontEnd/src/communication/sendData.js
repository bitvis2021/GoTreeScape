//	Compute an array of nodes based on hierarchical data
import axios from 'axios'
// let server_address = 'http://115.27.161.238/navitreetor'
let server_address = 'http://127.0.0.1:14449'
// let server_address = 'http://vis.pku.edu.cn/gotreescape'

function parseStr2Obj(previewRepresentative) {
  for (let i = 0; i < previewRepresentative.length; i++) {
    for (let j = 0; j < previewRepresentative[i].length; j++) {
      let previewObj = previewRepresentative[i][j]
      if ((typeof(previewObj['dsl']) === 'string') && ((previewObj['dsl'].length) > 0)) {
        previewObj['dsl'] = JSON.parse(previewObj['dsl'])
      }
    }
  }
}

export function getGoTreeGrammarObj (formData, queryGoTreeGrammarCallback) {
  axios({
    methods: 'get',
    url: server_address + '/template/query/gotree',
    params: formData,
    timeout: 50000
  })
  .then((res) => {
    let dslObj = res['data']
    let dslName = formData['dslName']
    queryGoTreeGrammarCallback(dslObj, dslName)
    // queryGoTreeGrammarCallback(res.data, queryTemplateDefer)
  })
}

export function getFilterCollection (formData, getFilterCollectionCallback) {
  axios({
    methods: 'get',
    url: server_address + '/template/query/filter',
    params: formData,
    timeout: 50000
  })
  .then((res) => {
    getFilterCollectionCallback(res['data'])
    // queryGoTreeGrammarCallback(res.data, queryTemplateDefer)
  })
}

export function getClusterResultByLevel (formData, getClusterByLevelCallback) {
  axios({
    methods: 'get',
    url: server_address + '/cluster/level',
    params: formData,
    timeout: 50000
  })
  .then((res) => {
    // parseStr2Obj(res['data']['preview-representative'])
    getClusterByLevelCallback(res['data'])
  })
}

export function getExistedTreeVisCollection(getExistedTreeVisCollectionCallback) {
  axios({
    methods: 'get',
    url: server_address + '/existed',
    timeout: 50000
  })
  .then((res) => {
    getExistedTreeVisCollectionCallback(res['data'])
  })
}

export function getUploadTreeVisProjectionPos(formData, getUploadTreeVisProjectionPosCallback) {
  axios({
    methods: 'get',
    url: server_address + '/search',
    params: formData,
    timeout: 50000
  })
  .then((res) => {
    console.log('res', res)
    getUploadTreeVisProjectionPosCallback(res['data'])
  })
}
// export function getStartDSLIndex (queryStartDSLIndexCallback) {
//   axios({
//     methods: 'get',
//     url: server_address + '/template/query/dslindex',
//     timeout: 10000
//   })
//   .then((res) => {
//     queryStartDSLIndexCallback(res)
//     console.log('res', res)
//   })
// }

// export function sendTreeVisSVG (formData, sendTreeVisSVGCallback) {
//   axios.post(server_address + '/results/save', formData)
//   .then(function (response) {
//     console.log('finish', formData)
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
// }