//	Add default parameter Settings to DSL objects
export function addDslDefaultSetting(dslObj) {
	if (!('Element' in dslObj)) {
		dslObj.Element = {}
	}
	if (!('CoordinateSystem' in dslObj)) {
		dslObj.CoordinateSystem = {}
	}
	if (!('Layout' in dslObj)) {
		dslObj.Layout = {}
	}
	add_node_default_setting(dslObj.Element)
	add_link_default_setting(dslObj.Element)
	add_label_default_setting(dslObj.Element)
	add_coordinate_system_default_setting(dslObj.CoordinateSystem)
	add_layout_default_setting(dslObj.Layout)
	return dslObj
}
//	Added default parameter Settings to Element in DSL
function add_node_default_setting(elementDsl) {
	let DefaultStaticSize = 5
	let DefaultSizeOption = ['fill', 'static']
	let DefaultStaticColor = '#6baed6'
	let DefaultColorRange = ['#2171b5','#deebf7']
	let DefaultColorSchemaOption = ['option1', 'option2']
	if (!('Node' in elementDsl)) { 
		elementDsl.Node = 'hidden'
	}
	if (!('SizeOption' in elementDsl)) { 
		elementDsl.SizeOption = DefaultSizeOption[0]
	}
	if (!('RootWidth' in elementDsl)) { 
		elementDsl.RootWidth = 'adaptive'
	}
	if (!('RootHeight' in elementDsl)) { 
		elementDsl.RootHeight = 'adaptive'
	}
	if (!('StaticSize' in elementDsl)) { 
		elementDsl.StaticSize = DefaultStaticSize
	}
	if (!('Color' in elementDsl)) { 
		elementDsl.Color = 'static'
	}
	if (!('StaticColor' in elementDsl)) {
		elementDsl.StaticColor = DefaultStaticColor
	}
	if (!('ColorRange' in elementDsl)) {
		elementDsl.ColorRange = DefaultColorRange
	}
	if (!('ColorSchema' in elementDsl)) {
		elementDsl.ColorSchema = DefaultColorSchemaOption[0]
	} 
}
//	Add default parameter Settings for labels in the element of the DSL
function add_label_default_setting(elementDsl) {
	let DefaultLabelAnchor = 'middle'
	let DefaultTextDx = 0
	let DefaultTextDy = 0
	let DefaultTextRotation = 0
	if (!('Label' in elementDsl)) {
		elementDsl.Label = 'hidden'
	}
	if (!('LabelAnchor' in elementDsl)) {
		elementDsl.LabelAnchor = 'middle'
	}
	if (!('TextDx' in elementDsl)) {
		elementDsl.TextDx = DefaultTextDx
	}
	if (!('LabelDy' in elementDsl)) {
		elementDsl.TextDy = DefaultTextDy
	}
	if (!('TextRotation' in elementDsl)) {
		elementDsl.TextRotation = DefaultTextRotation
	}
	// elementDsl.TextDx = Math.floor(elementDsl.TextDx * 100)
	// elementDsl.TextDy = Math.floor(elementDsl.TextDy * 100)
	// elementDsl.TextRotation = Math.floor(elementDsl.TextRotation * 100)	
}
//	Added default parameter Settings for link in Element of DSL
function add_link_default_setting(elementDsl) {
	let DefaultStaticThickness = 2
	let DefaultMinThickness = 1
	let DefaultMaxThickness = 10
	let ArcDirectionOptions = ['top', 'bottom']
	if (!('Link' in elementDsl)) {
		elementDsl.Link = 'hidden'
	}
	if (!('Thickness' in elementDsl)) {
        elementDsl.Thickness = 'static'
    }
    if (!('StaticThickness' in elementDsl)) {
        elementDsl.StaticThickness = DefaultStaticThickness
    } 
    if (!('MinThickness' in elementDsl)) {
        elementDsl.MinThickness = DefaultMinThickness
    } 
    if (!('MaxThickness' in elementDsl)) {
        elementDsl.MaxThickness = DefaultMaxThickness
    } 
    if (!('ArcDirection' in elementDsl)) {
        elementDsl.ArcDirection = ArcDirectionOptions[0]
    }
}
//	Add default parameter Settings for link in the DSL CoordinateSystem
function add_coordinate_system_default_setting(CoordDsl) {
	let DirectionOptions = ['clockwise', 'anticlockwise']
	let PolarAxisOptions = ['y-axis', 'x-axis']
	let DefaultPolarCenterPara = 'top'
	let DefaultCategoryPara = "cartesian"
	let DefaultCentralAngle = 1
	let DefaultStartAngle = 0
	let DefaultInnerRadius = 0
	if (!('Category' in CoordDsl)) {
		CoordDsl.Category = DefaultCategoryPara
	}
	if (!('Direction' in CoordDsl)) {
        CoordDsl.Direction = DirectionOptions[0]
    }
    if (!('CentralAngle' in CoordDsl)) {
        CoordDsl.CentralAngle = DefaultCentralAngle
    }
    if (!('StartAngle' in CoordDsl)) {
    	CoordDsl.StartAngle = DefaultStartAngle
    }
    if (!('InnerRadius' in CoordDsl)) {
    	CoordDsl.InnerRadius = DefaultInnerRadius
    }
    if (!('PolarAxis' in CoordDsl)) {
        CoordDsl.PolarAxis = PolarAxisOptions[0]
    }
    if (!('PolarCenter' in CoordDsl)) {
        CoordDsl.PolarCenter = DefaultPolarCenterPara
    }
    // CoordDsl.CentralAngle = Math.floor(CoordDsl.CentralAngle * 100)
    // CoordDsl.StartAngle = Math.floor(CoordDsl.StartAngle * 100)
    // CoordDsl.InnerRadius = Math.floor(CoordDsl.InnerRadius * 100)
}
//	Add default parameter Settings to the DSL layout
function add_layout_default_setting(LayoutDsl) {
	//	If the user doesn't set a layout parameter, leave it Undefined
	//	Specifically, the relationship between father and son is set as include, and the relationship between brothers is set as align
	let defaultCategory = 'AxisIndependent'
	let defaultMode = 'bottom-up'
	if (!('Category' in LayoutDsl)) {
		LayoutDsl.Category = defaultCategory
	}
	if (!('Mode' in LayoutDsl)) {
		LayoutDsl.Mode = defaultMode
	}
	if (!('X' in LayoutDsl)) {
		LayoutDsl.X = {}
	}
	if (!('Y' in LayoutDsl)) {
		LayoutDsl.Y = {}
	}
	add_root_layout_default_setting(LayoutDsl)
	add_subtree_layout_default_setting(LayoutDsl)
}
//	Added default Settings for parent and child
function add_root_layout_default_setting(LayoutDsl) {
	// 	Increases the parameter along the 'X' axis
	if (!('Root' in LayoutDsl['X'])) {
		LayoutDsl['X']['Root'] = {}
	}
	add_axis_layout_default_setting(LayoutDsl['X']['Root'], 'X')
	//	Add padding and margin parameters
	add_margin_unit(LayoutDsl['X']['Root'])
	add_padding_unit(LayoutDsl['X']['Root'])
	// 	Increases the parameter along the 'Y' axis
	if (!('Root' in LayoutDsl['Y'])) {
		LayoutDsl['Y']['Root'] = {}
	}	
	add_axis_layout_default_setting(LayoutDsl['Y']['Root'], 'Y')
	//	Add padding and margin parameters
	add_margin_unit(LayoutDsl['Y']['Root'])
	add_padding_unit(LayoutDsl['Y']['Root'])
	function add_axis_layout_default_setting(AxisRootLayoutDsl, axisType) {
		let defaultRelation = 'Undefined'
		let defaultMargin = 0
		let defaultMarginUnit = ""
		let defaultPadding = [0, 0]
		let defaultPaddingUnit = ["", ""]
		let defaultPosition = 'left'
		if (axisType === 'Y') {
			defaultPosition = 'top'
		}
		let defaultAlignment = 'middle'
		if (!('Relation' in AxisRootLayoutDsl)) {
			AxisRootLayoutDsl['Relation'] = defaultRelation
		}
		if (!('Alignment' in AxisRootLayoutDsl)) {
			AxisRootLayoutDsl['Alignment'] = defaultAlignment
		}
		if (!('Position' in AxisRootLayoutDsl)) {
			AxisRootLayoutDsl['Position'] = defaultPosition
		}
		if (!('Margin' in AxisRootLayoutDsl)) {
			AxisRootLayoutDsl['Margin'] = defaultMargin
		}
		if (!('Padding' in AxisRootLayoutDsl)) {
			AxisRootLayoutDsl['Padding'] = defaultPadding
		}
		if (!('Margin_' in AxisRootLayoutDsl)) {
			AxisRootLayoutDsl['Margin_'] = defaultMarginUnit
		}
		if (!('Padding_' in AxisRootLayoutDsl)) {
			AxisRootLayoutDsl['Padding_'] = defaultPaddingUnit
		}
	}
}
//	Added default parameter Settings between subtrees
function add_subtree_layout_default_setting(LayoutDsl) {
	//	Increase the parameter along the X axis
	if (!('Subtree' in LayoutDsl['X'])) {
		LayoutDsl['X']['Subtree'] = {}
	}
	add_axis_layout_default_setting(LayoutDsl['X']['Subtree'])
	//	Add the margin parameter
	add_margin_unit(LayoutDsl['X']['Subtree'])
	//	Increase the parameter along the Y axis
	if (!('Subtree' in LayoutDsl['Y'])) {
		LayoutDsl['Y']['Subtree'] = {}
	}
	add_axis_layout_default_setting(LayoutDsl['Y']['Subtree'])
	//	Add the margin parameter
	add_margin_unit(LayoutDsl['Y']['Subtree'])
	function add_axis_layout_default_setting(AxisSubtreeLayoutDsl) {
		let defaultRelation = 'Undefined'
		let defaultAlignment = 'middle'
		let defaultMargin = 0
		let defaultMarginUnit = ""		
		let DefaultSortingCriteria = 'null'
		let defaultSortingOrder = 'asc'
		if (!('Relation' in AxisSubtreeLayoutDsl)) {
			AxisSubtreeLayoutDsl['Relation'] = defaultRelation
		}
		if (!('Alignment' in AxisSubtreeLayoutDsl)) {
			AxisSubtreeLayoutDsl['Alignment'] = defaultAlignment
		}
		if (!('Margin' in AxisSubtreeLayoutDsl)) {
			AxisSubtreeLayoutDsl['Margin'] = defaultMargin
		}
		if (!('Margin_' in AxisSubtreeLayoutDsl)) {
			AxisSubtreeLayoutDsl['Margin_'] = defaultMarginUnit
		}
		if (!('SortingCriteria' in AxisSubtreeLayoutDsl)) {
			AxisSubtreeLayoutDsl['SortingCriteria'] = DefaultSortingCriteria
		}
		if (!('SortingOrder' in AxisSubtreeLayoutDsl)) {
			AxisSubtreeLayoutDsl['SortingOrder'] = defaultSortingOrder
		}
	}
}
//	Add the unit of padding to the DSL
function add_padding_unit(AxisLayoutDsl) {
	if ('Padding' in AxisLayoutDsl) {
		if (isNaN(AxisLayoutDsl.Padding[0])) {
			AxisLayoutDsl.Padding_ = [AxisLayoutDsl.Padding[0].slice(-1), '']
			AxisLayoutDsl.Padding[0] = +AxisLayoutDsl.Padding[0].slice(0, -1)
		}
		if (isNaN(AxisLayoutDsl.Padding[1])) {
			AxisLayoutDsl.Padding_[1] = AxisLayoutDsl.Padding[1].slice(-1)
			AxisLayoutDsl.Padding[1] = +AxisLayoutDsl.Padding[1].slice(0, -1)
		}
	}
}
//	Add the unit of margin to the DSL
function add_margin_unit(AxisLayoutDsl) {
	if ('Margin' in AxisLayoutDsl) {
		if (isNaN(AxisLayoutDsl.Margin)) {
			AxisLayoutDsl.Margin_ = AxisLayoutDsl.Margin.slice(-1)
			AxisLayoutDsl.Margin = +AxisLayoutDsl.Margin.slice(0, -1)
		}
	}
}
