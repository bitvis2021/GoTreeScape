<template>
  <div class = "dsl-list-view-title">
    <span class = "text">{{title}}</span>
  </div>
</template>

<script> 
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'DSLListTitle',
  props: {
  },
  data() {
    return {
    	title: 'TemplateView',
    }
  },
  created: function() {},
  beforeMount: function() {
  },
  mounted: function() {
  },
  watch: {
  },
  computed: {  
  },  
  methods: {
  	saveNewDSL: function() {
  		console.log('save')
  	},
  	removeCurrentDSL: function() {
  		console.log('remove')
  	}
  }
}
</script>

<style scoped lang="less">
  .dsl-list-view-title {
    display: flex; 
    width: 100%; 
    height: 100%; 
    margin: auto; 
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    border-bottom: 1px solid #E4E7ED;
    .text {
       padding-left: 0.5rem;
       margin-left: 0; /* Important */ 
       margin-right: 0; /* Important */ 
       margin-top: auto; /* Important */ 
       margin-bottom: auto; /* Important */ 
       text-align: left;
       font-weight: bold;
    }
  }
</style>
