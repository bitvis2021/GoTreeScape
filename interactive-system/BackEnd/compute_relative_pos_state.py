################################################################################
# compute the relative positions according to the zooming ranges    
# Authors: Guozheng Li email: guozhg.li@gmail.com
################################################################################
def compute_relative_pos_state(displayed_data_range, interior_cluster_pos_range):
    '''
        compute the relative positions of two rectaugular space
        {"x": [-14.37596, 20.67741], "y": [-14.279471, 21.032482]}
    '''
    display_min_x = displayed_data_range['x'][0]
    display_max_x = displayed_data_range['x'][1]
    display_min_y = displayed_data_range['y'][0]
    display_max_y = displayed_data_range['y'][1]
    cluster_min_x = interior_cluster_pos_range['x'][0]
    cluster_max_x = interior_cluster_pos_range['x'][1]
    cluster_min_y = interior_cluster_pos_range['y'][0]
    cluster_max_y = interior_cluster_pos_range['y'][1]
    if (cluster_min_x <= display_min_x <= display_max_x <= cluster_max_x) and (cluster_min_y <= display_min_y <= display_max_y <= cluster_max_y):
        return 'displayed_range_within_cluster_range'
    if (display_min_x <= cluster_min_x <= cluster_max_x <= display_max_x) and (display_min_y <= cluster_min_y <= cluster_max_y <= display_max_y): 
        return 'displayed_range_contain_cluster_range'
    if (display_min_x > cluster_max_x) or (display_max_x < cluster_min_x) or (display_min_y > cluster_max_y) or (display_max_y < cluster_min_y):
        return 'displayed_range_apart_cluster_range'
    return 'displayed_range_intersect_cluster_range'