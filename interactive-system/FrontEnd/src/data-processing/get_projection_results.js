// Preprocessing data
function data_processing(data) {
    for (let i = 0; i < data.length; i++) {
        let data_item = data[i]
        data_item['x'] = Number(data_item['x'])
        data_item['y'] = Number(data_item['y'])
    }
    return data
}
// remove the blank from the item values
function remove_blank(dsl_list_content) {
    for(let i = 0; i < dsl_list_content.length; i++) {
        dsl_list_content[i] = dsl_list_content[i].replace(' ', '')
        dsl_list_content[i] = +dsl_list_content[i]
    }
    return dsl_list_content
}
// //  TODO Export the hierarchical data
// export async function getProjectionResults() {
//     //  The global Graph object
//     // var json_data = await d3.json('projectionResults/partial10000.json')
//     var data = await d3.csv('projectionResults/embeddings-results-1000.csv')
//     // var data = await d3.csv('projectionResults/embeddings-svg-results-1000.csv')
//     data_processing(data)
//     return data
// 
//  Only for test
export async function getProjectionResults() {
    //  The global Graph object
    // dsl-amount == 191000
    // var data = await d3.csv('projectionResults/proj_point_list.csv')
    // var data = await d3.csv('projectionResults/proj_point_list_19.csv')
    // var data = await d3.csv('projectionResults/proj_point_list_382.csv')
    // var data = await d3.csv('projectionResults/proj_point_list_955.csv')
    // var data = await d3.csv('projectionResults/proj_point_list_1910.csv')
    // var data = await d3.csv('projectionResults/proj_point_list_per30.csv')
    // var data = await d3.csv('projectionResults/proj_point_list_191000.csv')
    // dr_cudatsne_2d_filtered_treevis_results_per50_ite2000
    // dr_cudatsne_2d_filtered_treevis_results_per50_ite1000
    // var data = await d3.csv('projectionResults/dr_cudatsne_2d_sampling_results_100.csv')
    // var data = await d3.csv('projectionResults/dr_cudatsne_2d_filtered_treevis_results_per50_ite3000_glyph_select100.csv')
    // var data = await d3.csv('projectionResults/dr_cudatsne_2d_embeddings-results-with-weights.csv')
    // var data = await d3.csv('projectionResults/refined-treevis-dataset-embeddings_latent2-results.csv')
    // var data = await d3.csv('projectionResults/refined-treevis-dataset-embeddings_not_simplify-results-umap.csv')
    // var data = await d3.csv('projectionResults/refined-treevis-dataset-embeddings_weight-results-umap.csv')

    // dsl-amount == 314640
    // tsne projection results
    // var data = await d3.csv('projectionResults/dsl_amount_314640-cudatsne_per50_ite3000-dbscan_eps_0.005.csv')
    // var data = await d3.csv('projectionResults/dsl_amount_314640-cudatsne_per50_ite3000.csv')
    
    // tsne projection results
    // var data = await d3.csv('projectionResults/embeddding-results-umap-with-weights.csv')
    // var data = await d3.csv('projectionResults/dr_cudatsne_2d_filtered_treevis_results_per50_ite3000.csv')
    
    // Umap projection results
    // <dsl_amount_314640-umap.csv> is the most satisfied results till now
    // var data = await d3.csv('projectionResults/dsl_amount_314640-umap-all_weight_1-generate_order-latent_20-training_from_start.csv')
    // BEST RESULTS
    // 
    var data = await d3.csv('projectionResults/dsl_amount_62340_mds_weight10.csv')
    // MDS PROJECTION RESULTS
    // dsl_amount_62340_mds_weight10_index_623.csv
    // dsl_amount_62340_mds_weight10.csv
    // dsl_amount_62340_mds_weight9.csv
    // dsl_amount_62340_mds_weight4.csv
    // 
    // dsl_amount_62340_latent2d_weight4.csv
    // dsl_amount_62340_latent2d_weight9.csv
    // dsl_amount_62340_per50_umap_weight4.csv
    // dsl_amount_62340_per50_umap_weight9.csv
    // 
    // dsl_amount_62340_per50_tsne_weight4
    // dsl_amount_62340_per50_tsne_weight9
    // 
    // NEW WEIGHT COMPUTATION
    // dsl_amount_314640_custom_umap_weight4
    // dsl_amount_314640_custom_umap_weight5
    // dsl_amount_314640_custom_umap_weight6
    // dsl_amount_314640_custom_umap_weight7
    // dsl_amount_314640_custom_umap_weight8
    // dsl_amount_314640_custom_umap_weight9
    // dsl_amount_314640_custom_umap_weight10
    // dsl_amount_314640_custom_umap_weight10_cluster1
    // dsl_amount_314640_custom_umap_weight10_cluster2
    // dsl_amount_314640_custom_umap_weight10_neighbor100
    // dsl_amount_314640_umap_weight4
    // dsl_amount_314640_umap_weight5
    // dsl_amount_314640_umap_weight6
    // dsl_amount_314640_umap_weight7
    // dsl_amount_314640_per30_tsne_weight1
    // dsl_amount_314640_per30_tsne_weight2
    // dsl_amount_314640_per30_tsne_weight3
    // dsl_amount_314640_per50_tsne_weight4
    // dsl_amount_314640_per50_tsne_weight5
    // dsl_amount_314640_per50_tsne_weight6
    // dsl_amount_314640_per50_tsne_weight7
    // dsl_amount_314640_per50_tsne_weight8
    // dsl_amount_314640_per50_tsne_weight9
    // dsl_amount_314640_per50_tsne_weight10
    // DSL AMOUNT 62340
    // TSNE algorithm
    // dsl_amount_62340_per50_tsne_weight10
    // dsl_amount_62340_per100_tsne_weight10
    // UMAP algorithm
    // dsl_amount_62340_per50_umap_weight10
    // dsl_amount_62340_per100_umap_weight10
    // MDS algorithm
    // dsl_amount_62340_mds_weight10_index_1039
    // dsl_amount_62340_mds_weight10_index_623
    // dsl_amount_62340_mds_weight10_index_519
    // var data = await d3.csv('projectionResults/dsl_amount_314640_per50_tsne_diff_weight1.csv')

    // Test results
    // var data = await d3.csv('projectionResults/test-collection/umap-embeddings-results11.csv')
    // var data = await d3.csv('projectionResults/test-collection/umap-embeddings-results12.csv')
     
    // var data = await d3.csv('projectionResults/test-collection/umap-embeddings-results13.csv')
    // var data = await d3.csv('projectionResults/test-collection/umap-embeddings-results21.csv')
    // var data = await d3.csv('projectionResults/test-collection/umap-embeddings-results22.csv')
    // var data = await d3.csv('projectionResults/test-collection/umap-embeddings-results23.csv')
    // var data = await d3.csv('projectionResults/test-collection/umap-embeddings-results-0.csv')
    // var data = await d3.csv('projectionResults/test-collection/umap-embeddings-results-best-1.csv')
    // var data = await d3.csv('projectionResults/dsl_amount_314640-umap-generate_order.csv')
    // <dsl_amount_314640-umap-dbscan_eps_0.2.csv> add dbscan clusters based on the <embedding-results-umap.csv>
    // var data = await d3.csv('projectionResults/dsl_amount_314640-umap-dbscan_eps_0.2.csv')
    // after testing, the results <dsl_amount_314640-umap-test_whether_train_with_weight.csv> is not satisfied
    // var data = await d3.csv('projectionResults/dsl_amount_314640-umap-test_whether_train_with_weight.csv')
    // Simplified the tree visualization results, but the results are not very well
    // var data = await d3.csv('projectionResults/refined-treevis-dataset-embeddings-results-umap.csv')
    
    // latent2 vectors
    // embeddings-results-latent_2.csv is the results without dimension reduction
    // dsl_amount_314640-umap-latent_2
    // var data = await d3.csv('projectionResults/dsl_amount_314640-umap-latent_2.csv')
    // dimension reduction based on one hot
    // var data = await d3.csv('projectionResults/dsl_amount_314640-onehot-umap.csv') 
    // dr_results_with_label_upper_class_0.005
    for (let i = 0; i < data.length; i++) {
        let data_item = data[i]
        data_item['x'] = Number(data_item['x'])
        data_item['y'] = Number(data_item['y'])
    }
    return data
}
//  Only for test2
// export async function getProjectionResults() {
//     //  The global Graph object
//     let data = await d3.json('projectionResults/samplePoints-1250-1599.json') 
//     console.log('data', data)
//     // samplePoints-1250-1599
//     // samplePoints-6000-292
//     // samplePoints-25000-21
//     // samplePoints-100000-1
//     let processed_data_list = []
//     for (let i = 0; i < data.length; i++) {
//         let data_item = data[i]
//         let processed_data_item = {}
//         processed_data_item['x'] = Number(data_item['lat'])
//         processed_data_item['y'] = Number(data_item['lng'])
//         processed_data_list.push(processed_data_item)
//     }
//     return processed_data_list
// }

//  Export the hierarchical data
export async function getProjectionDSLList() {
    //  The global Graph object
    // var json_data = await d3.json('projectionResults/partial10000.json')
    // var rendering_dsl_list = await d3.csv('projectionResults/rendering_dsl_list-1000.json')
    // var dsl_list_content = rendering_dsl_list["columns"]
    // console.log('dsl_list_content', dsl_list_content)
    // SVG projection results 
    var dsl_list_content = await d3.json('projectionResults/rendering_svg_list-1000.json')
    return remove_blank(dsl_list_content)
}

//  Export the hierarchical data
export async function getProjectionSVGList() {
    //  The global Graph object
    // var json_data = await d3.json('projectionResults/partial10000.json')
    var rendering_svg_list = await d3.json('projectionResults/rendering_svg_list-1000.json')
    // return remove_blank(dsl_list_content)
}

export async function getExistedTreeVisCollection() {
    var existed_tree_vis_collection = await d3.json('existedTreeVisCollection/existed_tree_vis_collection.json')
    return existed_tree_vis_collection
}
