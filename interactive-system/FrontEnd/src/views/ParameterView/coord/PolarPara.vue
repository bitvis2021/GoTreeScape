<template>
    <div id="polarPara">
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="7" class="panel_para">
                <span>start</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="14" class="panel_control">
                <el-slider
                     @input="changeDSL__"
                     @change="changeCanvas"
                    v-model="StartAngle"/>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        
        
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="7" class="panel_para">
                <span>central</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="14" class="panel_control">
                <el-slider
                     @input="changeDSL__"
                     @change="changeCanvas"
                    v-model="CentralAngle"/>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        
        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="7" class="panel_para">
                <span>inner r</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="14" class="panel_control">
                <el-slider
                    @input="changeDSL__"
                    @change="changeCanvas"
                    v-model="InnerRadius"/>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>

        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="7" class="panel_para">
                <span>direction</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="14" class="panel_control">
                <el-select v-model="Direction" size="mini" @change="changeDSL_">
                    <el-option
                        v-for="item in DirectionOptions"
                        :key="item"
                        :label="item"
                        :value="item"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>

        <el-row type="flex" align="middle" justify="space-around">
            <el-col :span="1"></el-col>
            <el-col :span="7" class="panel_para">
                <span>polar axis</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="14" class="panel_control">
                <el-select v-model="PolarAxis" size="mini" @change="changeDSL_">
                    <el-option
                        v-for="item in PolarAxisOptions"
                        :key="item"
                        :label="item"
                        :value="item"/>
                </el-select>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row type="flex" align="middle" justify="space-around" class="outer-row">
            <el-col :span="1"></el-col>
            <el-col :span="7" class="panel_para">
                <span>center pos</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="14">
                <el-radio-group v-model="PolarCenterPos" @change="changeDSL_" size="mini">
                  <el-radio-button :label="PolarAxis==='x-axis'?'left':'top'"/>
                  <el-radio-button :label="PolarAxis==='x-axis'?'right':'bottom'"/>
                </el-radio-group>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
        <el-row type="flex" align="middle" justify="space-around" class="outer-row">
            <el-col :span="1"></el-col>
            <el-col :span="7" class="panel_para">
                <span>center type</span>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="14">
                <el-radio-group v-model="PolarCenterType" @change="changeDSL_" size="mini">
                  <el-radio-button label='root'/>
                  <el-radio-button label='parent'/>
                </el-radio-group>
            </el-col>
            <el-col :span="1"></el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "polar-para",
    props: {
        CoordDsl: Object,
        changeDSL: Function,
        changeCanvas: Function
    },
    data() {
        return {
            DirectionOptions: [
                'clockwise',
                'anticlockwise'
            ],
            PolarAxisOptions: [
                'y-axis',
                'x-axis'
            ],
            CentralAngle: 100,
            StartAngle: 0,
            InnerRadius: 0,
            CenterPara: 0,
            Direction: '',
            PolarAxis: '',
            PolarCenterPos: 'top',
            // PolarAxisPara: 'top',
            PolarCenterType: 'root'
        }
    },
    mounted: function() {
        // console.log('polar-para', this.CoordDsl)
    },
    created: function () {
        // set default parameters
        if (!('Direction' in this.CoordDsl)) {
            this.CoordDsl.Direction = this.DirectionOptions[0]
            this.Direction = this.DirectionOptions[0]
        } else {
            this.Direction = this.CoordDsl.Direction
        }
        if (!('CentralAngle' in this.CoordDsl)) {
            this.CoordDsl.CentralAngle = 1
            this.CentralAngle = Math.floor(this.CoordDsl.CentralAngle * 100)
        } else {
            this.CentralAngle = this.CoordDsl.CentralAngle * 100
        }
        if (!('StartAngle' in this.CoordDsl)) {
            this.CoordDsl.StartAngle = 1
            this.StartAngle = Math.floor(this.CoordDsl.StartAngle * 100)
        } else {
            this.StartAngle = this.CoordDsl.StartAngle * 100
        }
        if (!('InnerRadius' in this.CoordDsl)) {
            this.CoordDsl.InnerRadius = 1
            this.InnerRadius = Math.floor(this.CoordDsl.InnerRadius * 100)
        } else {
            this.InnerRadius = this.CoordDsl.InnerRadius * 100
        }
        if (!('PolarAxis' in this.CoordDsl)) {
            this.CoordDsl.PolarAxis = this.PolarAxisOptions[0]
        } else {
            this.PolarAxis = this.CoordDsl.PolarAxis
        }
        if (!('PolarCenterPos' in this.CoordDsl)) {
            this.CoordDsl.PolarCenterPos = this.PolarCenterPos
        } else {
            this.PolarCenterPos = this.CoordDsl.PolarCenterPos
        }
        // // ======== TODO ========
        // if (!('PolarCenter' in this.CoordDsl)) {
        //     this.CoordDsl.PolarCenter = this.PolarAxisPara
        // } else {
        //     this.PolarAxisPara = this.CoordDsl.PolarCenter
        // } 
        if (!('PolarCenterType' in this.CoordDsl)) {
            this.CoordDsl.PolarCenterType = this.PolarCenterType
        } else {
            this.PolarCenterType = this.CoordDsl.PolarCenterType
        }
    },
    methods: {
        changeDSL_: function () {
            this.CoordDsl.PolarAxis = this.PolarAxis
            // TODO
            // this.CoordDsl.PolarCenter = this.PolarAxisPara
            this.CoordDsl.PolarCenterPos = this.PolarCenterPos
            this.CoordDsl.PolarCenterType = this.PolarCenterType
            this.CoordDsl.Direction = this.Direction
            if (this.PolarAxis === 'x-axis' && (this.PolarCenterPos === 'top' || this.PolarCenterPos === 'bottom')) {
                // this.CoordDsl.PolarCenter = 'left'
                // this.PolarAxisPara = 'left'
                // TODO
                this.CoordDsl.PolarCenterPos = 'left'
                this.PolarCenterPos = 'left'
            }
            if (this.PolarAxis === 'y-axis' && (this.PolarCenterPos === 'left' || this.PolarCenterPos === 'right')) {
                // this.CoordDsl.PolarCenter = 'top'
                // this.PolarAxisPara = 'top'
                // TODO
                this.CoordDsl.PolarCenterPos = 'top'
                this.PolarCenterPos = 'top'
            }
            this.changeDSL()
            this.changeCanvas()
        },
        changeDSL__() {
            this.CoordDsl.CentralAngle = this.CentralAngle / 100.0
            this.CoordDsl.StartAngle = this.StartAngle / 100.0
            this.CoordDsl.InnerRadius = this.InnerRadius / 100.0
            this.changeDSL()
        }
    }
}
</script>
<style lang="less">
    #polarPara {
        .el-row {
            margin-bottom: 5px;
        }
    }
    .el-input--mini .el-input__inner {
        height: 22px !important;
        line-height: 22px !important;
    }
    .el-input--mini .el-input__icon {
        line-height: 22px !important;
    }
    .el-select-dropdown__item {
        height: 20px !important;
        line-height: 20px !important;
        font-size: 10px !important;
    }
    .el-slider__button {
        width: 12px !important;
        height: 12px !important;
    }
    .el-slider__runway {
        margin: 8px 0 !important;
    }
</style>
<style scoped>
.panel_para {
	/* background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.2rem; */
    font-size: 0.8rem;
    vertical-align: middle;
    line-height: 1.2rem;
    height: 1rem;
}

/* .panel_control {
    height: 2rem;
	background: antiquewhite;
	border: 1px solid rgb(148, 144, 144);
	border-radius: 0.2rem;
} */

</style>