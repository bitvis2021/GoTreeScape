<template>
    <div>
        <el-row type="flex" align="middle" justify="space-around" class="outer-row">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>{{axis==='X' ? 'padding-left ' : 'padding-top '}}</span>
                <el-popover
                  placement="left"
                  width="190"
                  trigger="click">
                    <el-radio-group class="unit-controller" @change="changePaddingLeftTop" 
                        v-model="paddingLeftTop" size="mini">
                        <el-radio-button label="treeUnit"></el-radio-button>
                        <el-radio-button label="rootWidth"></el-radio-button>
                        <el-radio-button label="rootHeight"></el-radio-button>
                    </el-radio-group>
                    <el-button class="margin-controller" slot="reference"><span class="icon iconfont icon-chizi_o unit-setting"></span></el-button>
                </el-popover>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-row type="flex" align="middle" justify="space-around">
                    <el-col :span="24">
                        <el-slider
                            @input="changeDSL_"
                            @change="changeDSL__"
                            :min="-100"
                            v-model="leftPadding"/>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row type="flex" align="middle" justify="space-around" class='outer-row'>
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>{{axis==='X' ? 'padding-right ' : 'padding-bottom '}}</span>
                <el-popover
                  placement="left"
                  width="190"
                  trigger="click">
                    <el-radio-group class="unit-controller" @change="changePaddingRightBottom" 
                        v-model="paddingRightBottom" size="mini">
                        <el-radio-button label="treeUnit"></el-radio-button>
                        <el-radio-button label="rootWidth"></el-radio-button>
                        <el-radio-button label="rootHeight"></el-radio-button>
                    </el-radio-group>
                    <el-button class="margin-controller" slot="reference"><span class="icon iconfont icon-chizi_o unit-setting"></span></el-button>
                </el-popover>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-row type="flex" align="middle" justify="space-around">
                    <el-col :span="24">
                        <el-slider
                            @input="changeDSL_"
                            @change="changeDSL__"
                            :min="-100"
                            v-model="rightPadding"/>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    name: "include-para",
    props: {
        axisDsl: Object,
        axis: String,
        changeDSL: Function,
        changeCanvas: Function
    },
    data() {
        return {
            units: [
                "",
                "h",
                "w"
            ],
            leftPadding: 0,
            rightPadding: 0,
            paddingRightBottom: 'treeUnit',
            paddingLeftTop: 'treeUnit'
        }
    },
    created: function() {
        // console.log('include-para', this.axisDsl)
        if ('Padding' in this.axisDsl) {
            this.leftPadding = Math.floor(this.axisDsl.Padding[0] * 100)
            this.rightPadding = Math.floor(this.axisDsl.Padding[1] * 100)
        } else {
            this.axisDsl.Padding = [0, 0]
        }
        if ('Padding_' in this.axisDsl) {
            if (this.axisDsl.Padding_[0] === '') {
                this.paddingLeftTop = 'treeUnit'
            } else {
                this.paddingLeftTop = this.axisDsl.Padding_[0] === 'w' ? 'rootWidth' : 'rootHeight'
            }
            if (this.axisDsl.Padding_[1] === '') {
                this.paddingRightBottom = 'treeUnit'
            } else {
                this.paddingRightBottom = this.axisDsl.Padding_[1] === 'w' ? 'rootWidth' : 'rootHeight'
            }
        } else {
            this.axisDsl.Padding_ = ['', '']
        }
    }, 
    methods: {
        changePaddingRightBottom: function() {
            // console.log('paddingRightBottom', this.paddingRightBottom)
            if (this.paddingRightBottom === 'treeUnit') {
                this.axisDsl.Padding_[1] = ''
            }
            if (this.paddingRightBottom === 'rootWidth') {
                this.axisDsl.Padding_[1] = 'w'
            }
            if (this.paddingRightBottom === 'rootHeight') {
                this.axisDsl.Padding_[1] = 'h'
            }
            this.changeDSL()
            this.changeCanvas()
        },
        changePaddingLeftTop: function() {
            // console.log('paddingLeftTop', this.paddingLeftTop)
            if (this.paddingLeftTop === 'treeUnit') {
                this.axisDsl.Padding_[0] = ''
            }
            if (this.paddingLeftTop === 'rootWidth') {
                this.axisDsl.Padding_[0] = 'w'
            }
            if (this.paddingLeftTop === 'rootHeight') {
                this.axisDsl.Padding_[0] = 'h'
            }
            this.changeDSL()
            this.changeCanvas()
        },
        changeDSL_() {
            this.axisDsl.Padding[0] = this.leftPadding / 100.0
            this.axisDsl.Padding[1] = this.rightPadding / 100.0
            this.changeDSL()
        },
        changeDSL__() {
            this.changeCanvas()
        }
    },
    watch: {
        manipulateValue(val) {
            let tmp = 'RootLeftPadding-' + this.axis.toLowerCase()
            if (this.manipulatePara === tmp) {
                this.leftPadding = val
            }
            tmp = 'RootRightPadding-' + this.axis.toLowerCase()
            if (this.manipulatePara === tmp) {
                this.rightPadding = val
            }
        }
    },
    computed: {
        ...mapState([
            'manipulatePara',
            'manipulateValue',
            'hoverParam',
            'hoverParamAxis'
        ])
    }
};
</script>

<style scoped>
.panel_para {
	/* background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.2rem; */
    font-size: 0.2rem;
    vertical-align: middle;
    line-height: 1rem;
/*    height: 2rem;*/
}
/* .outer-row {
    margin-bottom: 5px;
}
.panel_control {
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
    box-shadow: 0 0 2px rgba(255, 0, 0, 0.8);
    /*transition: ease 0.5s;*/
}


</style>