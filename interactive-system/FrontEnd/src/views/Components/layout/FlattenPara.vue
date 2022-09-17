<template>
    <div id="flattenPara"> 
        <el-row type="flex" align="middle" justify="space-around" :class="(hoverFlag ? 'hover':'') + ' outer-row'">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>margin</span>
                <el-popover
                  placement="left"
                  width="190"
                  trigger="click">
                    <el-radio-group class="unit-controller" @change="changeMarginUnit" v-model="marginUnit" size="mini">
                        <el-radio-button label="subtrees"></el-radio-button>
                        <el-radio-button label="rootWidth"></el-radio-button>
                        <el-radio-button label="rootHeight"></el-radio-button>
                    </el-radio-group>
                    <el-button class="margin-controller" slot="reference"><span class="icon iconfont icon-chizi_o unit-setting"></span></el-button>
                </el-popover>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-row class="slider-row" type="flex" align="middle" justify="space-around">
                    <el-col :span="24">
                        <el-slider
                            @input="changeDSL__"
                            @change="changeCanvas"
                            :min="-100"
                            v-model="Margin"/>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>type</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="MarginType" size="mini" @change="changeDSL_">
                  <el-option
                    v-for="item in MarginTypeList"
                    :key="item"
                    :label="item"
                    :value="item"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>sort</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="SortingCriteria" size="mini" @change="changeDSL_">
                  <el-option
                    v-for="item in valueList"
                    :key="item.attrName"
                    :label="item.attrName"
                    :value="item.attrName"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row v-if="SortingCriteria!=='null'" type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>order</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-select v-model="SortingOrder" size="mini" @change="changeDSL_">
                  <el-option
                    v-for="item in orderList"
                    :key="item"
                    :label="item"
                    :value="item"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    name: "flatten-para",
    props: {
        axisDsl: Object,
        axis: String,
        changeDSL: Function,
        changeCanvas: Function
    },
    data() {
        return {
            Margin: 0,
            SortingOrder: "asc",
            orderList: ["asc", "desc"],
            SortingCriteria: "null",
            marginUnit: 'subtrees',
            MarginType: 'space-around',
            MarginTypeList: [
                'space-around',
                'space-between'
            ]
        }
    },
    mounted: function() {
        // console.log('juxtapose-para', this.axisDsl)
        if ('Margin' in this.axisDsl) {
            this.Margin = Math.floor(this.axisDsl.Margin * 100)
        } else {
            this.axisDsl.Margin = 0
        }
        if ('Margin_' in this.axisDsl) {
            if (this.axisDsl.Margin_ === '') {
                this.marginUnit = 'subtrees'
            } else {
                this.marginUnit = this.axisDsl.Margin_ === 'w' ? 'rootWidth' : 'rootHeight'
            }
        } else {
            this.axisDsl.Margin_ = ''
        }
        if ('SortingOrder' in this.axisDsl) {
            this.SortingOrder = this.axisDsl.SortingOrder
        }
        if ('SortingCriteria' in this.axisDsl) {
            this.SortingCriteria = this.axisDsl.SortingCriteria
        }
        if ('MarginType' in this.axisDsl) {
            this.MarginType = this.axisDsl.MarginType
        } else {
            this.axisDsl.MarginType = this.MarginType
        }
        console.log('valueList', this.valueList, 'orderList', this.orderList)
    }, 
    watch: {
        manipulateValue(val) {
            let tmp = 'SubtreeMargin-' + this.axis.toLowerCase()
            if (this.manipulatePara === tmp) {
                this.Margin = val
            }
        }
    },
    methods: {
        changeMarginUnit: function() {
            // console.log('this.SubtreeMarginUnit', this.marginUnit)
            if (this.marginUnit === 'subtrees') {
                this.axisDsl.Margin_ = ''
            }
            if (this.marginUnit === 'rootWidth') {
                this.axisDsl.Margin_ = 'w'
            }
            if (this.marginUnit === 'rootHeight') {
                this.axisDsl.Margin_ = 'h'
            }
            this.changeDSL()
            this.changeCanvas()
        },
        changeDSL_() {
            this.axisDsl.SortingCriteria = this.SortingCriteria
            this.axisDsl.SortingOrder = this.SortingOrder
            this.axisDsl.MarginType = this.MarginType
            this.changeDSL()
            this.changeCanvas()
        },
        changeDSL__() {
            this.axisDsl.Margin = this.Margin / 100.0
            this.changeDSL()
        }
    },
    created: function () {
        // if ('SortingCriteria' in this.axisDsl) {
        //     this.SortingCriteria = this.axisDsl.SortingCriteria
        // } else {
        //     this.SortingCriteria = this.valueList[0].attrName
        //     this.axisDsl.SortingCriteria = this.SortingCriteria
        // }
    },
    computed: {
        ...mapState([
            'attrObjArray',
		    'manipulatePara',
		    'manipulateValue',
            'hoverParam',
            'hoverParamAxis'
        ]),
        valueList: function() {
            let tmp = [{
                attrName: 'null',
			    attrType: 'default'
            }]
            this.attrObjArray.forEach((attr) => {
                tmp.push({...attr})
            })
            return tmp
        },
        hoverFlag() {
            if (this.hoverParamAxis === this.axis.toLowerCase() && this.hoverParam === 'SubtreeMargin') {
                return true
            } else {
                return false
            }
        }
    }
}
</script>
<style lang="less">
#flattenPara {
    .el-row {
        margin-bottom: 5px;
    }
    .slider-row {
        margin-bottom: 0px !important;
    }
}
// .el-input--mini .el-input__inner {
//     // height: 20px !important;
//     // line-height: 20px !important;
// }
</style>
<style scoped>
.panel_para {
	/* background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.2rem; */
    font-size: 0.2rem;
    vertical-align: middle;
    line-height: 1rem;
    height: 1rem;
}
/* .outer-row {
    margin-bottom: 5px;
} */
/* .panel_control {
	background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.2rem;
} */

.unit_0 {
    width: 0.6rem;
    height: 0.8rem;
    background: red;
}

.unit_1 {
    width: 0.6rem;
    height: 0.8rem;
    background: green;
}

.unit_2 {
    width: 0.6rem;
    height: 0.8rem;
    background: blue;
}

.hover {
    /*margin: 3px 5px;*/
    /*border: 1px solid #ddd;*/
    border-radius: 5px;
    box-shadow: 0 0 2px rgba(255, 0, 0, 0.5);
    /*transition: ease 0.5s;*/
}
</style>