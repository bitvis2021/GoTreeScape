<template>
    <div>
        <el-row type="flex" align="middle" justify="space-around" class="outer-row">
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>position</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <!--<el-button
                    size="mini" type="info"
                    round
                    @click="selectPosition('1')">
                    {{axis==='X' ? 'left' : 'top'}}
                </el-button>
                <el-button
                    size="mini" type="info"
                    round
                    @click="selectPosition('2')">
                    {{axis==='X' ? 'rigth' : 'bottom'}}
                </el-button> -->
                <el-radio-group v-model="selectedPosition" @change="changeDSL_" size="mini">
                  <el-radio-button :label="axis==='X'?'left':'top'"></el-radio-button>
                  <el-radio-button :label="axis==='X'?'right':'bottom'"></el-radio-button>
                </el-radio-group>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row type="flex" align="middle" justify="space-around" class='outer-row'>
            <el-col :span="1"></el-col>
            <el-col :span="6" class="panel_para">
                <span>margin</span>
                <el-popover
                  placement="left"
                  width="190"
                  trigger="click">
                    <el-radio-group class="unit-controller" @change="changeMarginUnit" v-model="marginUnit" size="mini">
                        <el-radio-button label="treeUnit"></el-radio-button>
                        <el-radio-button label="rootWidth"></el-radio-button>
                        <el-radio-button label="rootHeight"></el-radio-button>
                    </el-radio-group>
                    <el-button class="margin-controller" slot="reference"><span class="icon iconfont icon-chizi_o unit-setting"></span></el-button>
                </el-popover>
                <!--  -->
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="15" class="panel_control">
                <el-row type="flex" align="middle" justify="space-around">
                    <el-col :span="24">
                        <el-slider
                            @input="changeDSL__"
                            @change="changeCanvas"
                            :min="-100"
                            v-model="Margin"/>
                    </el-col>
                    <!-- <el-col :span="2">
                        <div class="unit_0" @click="() => { axisDsl.Margin_='' }"></div>
                    </el-col>
                    <el-col :span="2">
                        <div class="unit_1" @click="() => { axisDsl.Margin_='w' }"></div>
                    </el-col>
                    <el-col :span="2">
                        <div class="unit_2" @click="() => { axisDsl.Margin_='h' }"></div>
                    </el-col> -->
                </el-row>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    name: "juxtapose-para",
    props: {
        axisDsl: Object,
        axis: String,
        changeDSL: Function,
        changeCanvas: Function
    },
    data() {
        return {
            selectedPosition: "",
            Margin: 0,
            marginUnit: 'treeUnit'
        }
    },
    mounted: function() {
        if ('Margin' in this.axisDsl) {
            this.Margin = Math.floor(this.axisDsl.Margin * 100)
        } else {
            this.axisDsl.Margin = 0
        }
        if ('Position' in this.axisDsl) {
            this.selectedPosition = this.axisDsl.Position
        } else {
            this.axisDsl.Position = this.axis === "X" ? 'left' : 'top'
            this.selectedPosition = this.axis === "X" ? 'left' : 'top'
        }
        if ('Margin_' in this.axisDsl) {
            if (this.axisDsl.Margin_ === '') {
                this.marginUnit = 'treeUnit'
            } else {
                this.marginUnit = this.axisDsl.Margin_ === 'w' ? 'rootWidth' : 'rootHeight'
            }
        } else {
            this.axisDsl.Margin_ = ''
        }
    },
    watch: {
        manipulateValue(val) {
            let tmp = 'RootMargin-' + this.axis.toLowerCase()
            if (this.manipulatePara === tmp) {
                this.Margin = val
            }
        }
    },
    methods: {
        changeMarginUnit: function() {
            if (this.marginUnit === 'treeUnit') {
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
            if (this.axis === 'X') {
                this.axisDsl.Position = this.selectedPosition === '1' ? 'left' : 'right'
            } else {
                this.axisDsl.Position = this.selectedPosition === '1' ? 'top' : 'bottom'
            }
            this.axisDsl.Position = this.selectedPosition
            this.changeDSL()
            this.changeCanvas()
        },
        changeDSL__() {
            this.axisDsl.Margin = this.Margin / 100.0
            this.changeDSL()
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
}
</script>

<style lang="less">
    .icon.iconfont.unit-setting {
        font-size: 12px;
        &:hover {
            background: #ccc !important;
        };
    }
    .margin-controller {
        padding: 0px !important;
        border: none !important;
    }
    .el-popover.el-popper {
        text-align: center !important;
    }
    .unit-controller {
        .el-radio-button--mini .el-radio-button__inner {
            font-size: 10px !important;
        }
    }
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

/* .panel_control {
	background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.2rem;
}
.outer-row {
    margin-bottom: 5px;
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
    /*margin: 2px 3px;*/
    /*border: 1px solid #ddd;*/
    border-radius: 5px;
    box-shadow: 0 0 2px rgba(255, 0, 0, 0.5);
    /*transition: ease 0.5s;*/
}
</style>