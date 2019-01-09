<template>
    <div>
    </div>
</template>

<script>
    import { handleRequest } from 'libs';
    export default {
        data() {
            return {}
        },
        methods:{
	        helloWord(){
              handleRequest('post', '/api/hello', res => {
                  console.log();
                  this.$Message.success(response.statusText);
              });
	        }
	    }
    }
</script>

<style scoped>
</style>
