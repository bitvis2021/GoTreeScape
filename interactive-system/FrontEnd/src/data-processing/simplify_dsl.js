export default function (dsl_) {
    // console.log(dsl_.Layout.X.Root.Padding[0], dsl_.Layout.X.Root.Padding[1])
    let dsl = JSON.parse(JSON.stringify(dsl_))
    // console.log('tianmin simplify', dsl_)
    // return dsl_
    if ('Layout' in dsl) {
        if ('X' in dsl.Layout) {
            if ('Root' in dsl.Layout.X) {
                let root = dsl.Layout.X.Root
                if (root.Relation === 'include') {
                    // delete root.Padding
                    if ('Padding' in root) {
                        console.log(root.Padding[0], root.Padding[1])
                        // root.Padding[0] = root.Padding[0] + root.Padding_[0]
                        // root.Padding[1] = root.Padding[1] + root.Padding_[1]
                        if (root.Padding[0] === '0' && root.Padding[1] === '0') {
                            delete root.Padding
                        }
                    }
                    delete root.Padding_
                    delete root.Margin
                    delete root.Margin_
                    delete root.Position
                    delete root.Alignment
                }
                if (root.Relation === 'juxtapose') {
                    delete root.Padding
                    delete root.Padding_
                    // delete root.Margin
                    if ('Margin' in root) {
                        // root.Margin = root.Margin + root.Margin_
                        if (root.Margin === '0') {
                            delete root.Margin
                        }
                    }
                    delete root.Margin_
                    // delete root.Position
                    if (root.Position === 'left') {
                        delete root.Position
                    }
                    delete root.Alignment
                }
                if (root.Relation === 'within') {
                    delete root.Padding
                    delete root.Padding_
                    delete root.Margin
                    delete root.Margin_
                    delete root.Position
                    // delete root.Alignment
                    if (root.Alignment === 'middle') {
                        delete root.Alignment
                    }
                }
            }
            if ('Subtree' in dsl.Layout.X) {
                let subtree = dsl.Layout.X.Subtree
                if (subtree.Relation === 'flatten') {
                    delete subtree.Alignment
                    // delete subtree.Margin
                    if ('Margin' in subtree) {
                        // subtree.Margin = subtree.Margin + subtree.Margin_
                        if (subtree.Margin === '0') {
                            delete subtree.Margin
                        }
                    }
                    delete subtree.Margin_
                    // delete subtree.SortingOrder
                    if (subtree.SortingOrder === 'asc') {
                        delete subtree.SortingOrder
                    }
                    // delete subtree.SortingCriteria
                    if (subtree.SortingCriteria === 'null') {
                        delete subtree.SortingCriteria
                    }
                    if (subtree.MarginType === 'space-around') {
                        delete subtree.MarginType
                    }
                }
                if (subtree.Relation === 'align') {
                    // delete subtree.Alignment
                    if (subtree.Alignment === 'middle') {
                        delete subtree.Alignment
                    }
                    delete subtree.Margin
                    delete subtree.Margin_
                    delete subtree.SortingOrder
                    delete subtree.SortingCriteria
                    delete subtree.MarginType
                }
            }
        }
        if ('Y' in dsl.Layout) {
            if ('Root' in dsl.Layout.Y) {
                let root = dsl.Layout.Y.Root
                if (root.Relation === 'include') {
                    // delete root.Padding
                    if ('Padding' in root) {
                        // root.Padding[0] = root.Padding[0] + root.Padding_[0]
                        // root.Padding[1] = root.Padding[1] + root.Padding_[1]
                        if (root.Padding[0] === '0' && root.Padding[1] === '0') {
                            delete root.Padding
                        }
                    }
                    delete root.Padding_
                    delete root.Margin
                    delete root.Margin_
                    delete root.Position
                    delete root.Alignment
                }
                if (root.Relation === 'juxtapose') {
                    delete root.Padding
                    delete root.Padding_
                    // delete root.Margin
                    if ('Margin' in root) {
                        // root.Margin = root.Margin + root.Margin_
                        if (root.Margin === '0') {
                            delete root.Margin
                        }
                    }
                    delete root.Margin_
                    // delete root.Position
                    if (root.Position === 'top') {
                        delete root.Position
                    }
                    delete root.Alignment
                }
                if (root.Relation === 'within') {
                    delete root.Padding
                    delete root.Padding_
                    delete root.Margin
                    delete root.Margin_
                    delete root.Position
                    // delete root.Alignment
                    if (root.Alignment === 'middle') {
                        delete root.Alignment
                    }
                }
            }
            if ('Subtree' in dsl.Layout.Y) {
                let subtree = dsl.Layout.Y.Subtree
                if (subtree.Relation === 'flatten') {
                    delete subtree.Alignment
                    // delete subtree.Margin
                    if ('Margin' in subtree) {
                        // subtree.Margin = subtree.Margin + subtree.Margin_
                        if (subtree.Margin === '0') {
                            delete subtree.Margin
                        }
                    }
                    delete subtree.Margin_
                    // delete subtree.SortingOrder
                    if (subtree.SortingOrder === 'asc') {
                        delete subtree.SortingOrder
                    }
                    // delete subtree.SortingCriteria
                    if (subtree.SortingCriteria === 'null') {
                        delete subtree.SortingCriteria
                    }
                    if (subtree.MarginType === 'space-around') {
                        delete subtree.MarginType
                    }
                }
                if (subtree.Relation === 'align') {
                    // delete subtree.Alignment
                    if (subtree.Alignment === 'middle') {
                        delete subtree.Alignment
                    }
                    delete subtree.Margin
                    delete subtree.Margin_
                    delete subtree.MarginType
                    delete subtree.SortingOrder
                    delete subtree.SortingCriteria
                }
            }
        }
    }
    if ('Element' in dsl) {
        let element = dsl.Element
        if ('Node' in element) {
            if (element.Node !== 'circle') {
                delete element.SizeOption
                delete element.StaticSize
            } else {
                if (element.SizeOption === 'fill') {
                    delete element.StaticSize
                    delete element.SizeOption
                }
            }
            if (element.RootWidth === 'adaptive') {
                delete element.RootWidth
            }
            if (element.RootHeight === 'adaptive') {
                delete element.RootHeight
            }
            if (element.Node !== 'triangle') {
                delete element.Direction
            } else {
                if (element.Direction === 'top') {
                    delete element.Direction
                }
            }


            if (element.StaticColor === '#6baed6') {
                delete element.StaticColor
            }
            if (element.ColorSchema === 'option 1') {
                delete element.ColorSchema
            }
            if ('ColorRange' in element) {
                if (element.ColorRange[0] === '#2171b5' && element.ColorRange[1] === '#deebf7') {
                    delete element.ColorRange
                }
            }

            if (element.ColorType === 'default') {
                // delete element.StaticColor
                if (element.StaticColor === '#6baed6') {
                    delete element.StaticColor
                }
                delete element.ColorRange
                delete element.ColorSchema
            }
            if (element.ColorType === 'string') {
                delete element.StaticColor
                delete element.ColorRange
                // delete element.ColorSchema
                if (element.ColorSchema === 'option 1') {
                    delete element.ColorSchema
                }
            }
            if (element.ColorType === 'number') {
                delete element.StaticColor
                // delete element.ColorRange
                delete element.ColorSchema
                if (typeof(element.ColorRange) !== 'undefined') {
                    if (element.ColorRange[0] === '#2171b5' && element.ColorRange[1] === '#deebf7') {
                        delete element.ColorRange
                    }
                }
            }
            delete element.ColorType
            if (element.Color === 'height') {
                delete element.Color
            }

            if ('Label' in element) {
                if (element.Label === 'hidden') {
                    delete element.TextAnchor
                    delete element.TextDx
                    delete element.TextDy
                    delete element.TextRotation
                    delete element.Label
                }
            }
        }
        
        if ('Link' in element) {
            if (element.Link !== 'arccurve') {
                delete element.ArcDirection
            }
            if (element.Thickness === 'static') {
                // delete element.StaticThickness
                delete element.MinThickness
                delete element.MaxThickness
            } else {
                delete element.StaticThickness
                // delete element.MinThickness
                // delete element.MaxThickness
            }
        }
    }
    if ('CoordinateSystem' in dsl) {
        let coord = dsl.CoordinateSystem
        if ('Category' in coord) {
            if (coord.Category === 'cartesian') {
                delete coord.StartAngle
                delete coord.CentralAngle
                delete coord.PolarCenter
                delete coord.InnerRadius
                delete coord.Direction
                delete coord.PolarAxis
            }
            if (coord.Category === 'polar') {
                if (coord.CentralAngle === 1) {
                    delete coord.CentralAngle
                }
                if (coord.Direction === 'clockwise') {
                    delete coord.Direction
                }
                if (coord.PolarAxis === 'y-axis') {
                    delete coord.PolarAxis
                }
                if (coord.InnerRadius === 0) {
                    delete coord.InnerRadius
                }
                if (coord.PolarCenter === 'top') {
                    delete coord.PolarCenter
                }
                if (coord.StartAngle === 0) {
                    delete coord.StartAngle
                }
            }
        }
    }
    // console.log('tianmin simplify finished', dsl)
    return dsl
}