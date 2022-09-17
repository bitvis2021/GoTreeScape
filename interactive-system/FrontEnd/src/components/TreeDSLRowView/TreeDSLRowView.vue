<template>
	<div class = "treedsl-container">
		
	</div>
</template>

<script>
  import GoTreeSketchFigure from './GoTreeSketchFigure.vue';
  import { Drag, Drop } from 'vue-drag-drop';
  import { mapMutations } from 'vuex';

  export default {
	name: 'TreeDSLRowView',
	components: {
		GoTreeSketchFigure, Drag, Drop
	},
	data() {
	  return {
	  }
	},
	created: function () {
	},
	beforeMount: function() {	
	},
	mounted: function() {
	},
	computed: {
	},
	methods: {
 	}
  }
</script>

<style lang="less">
	.treedsl-container {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		width: 100%;
		height: 100%;
	}
</style>
