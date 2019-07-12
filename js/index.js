function _uuid() {
  	var d = Date.now();
  	if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
    	d += performance.now(); //use high-precision timer if available
  	}
  	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    	var r = (d + Math.random() * 16) % 16 | 0;
    	d = Math.floor(d / 16);
      	return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  	});
}
window.onload = function(){
    //Vue.use(VueDragging);
	var app = new Vue({
		components: {
            draggable:vuedraggable,
        },
        el: '#app',
        data: {
        	removeActive:false,
        	todoListDrag:false,
            doneListDrag:false,
        	totalTime:0,
        	times:{
        		work:25*60,
        		break:5*60
        	},
            sound:{
                work:"default",
                break:"default"
            },
            soundSrc:{
                none:"",
                default:"sound/Alarm_Clock.mp3"
            },
        	time:0,
        	timeId:0,
        	playing:false,
        	prevTime:0,
        	status:"work",
        	todoList:[
        		{title:"THE FIRST THING TO DO TODAY",id:_uuid(),count:0},
        		{title:"THE SECOND THING TO DO TODAY",id:_uuid(),count:0},
        		{title:"THE THIRD THING TO DO TODAY",id:_uuid(),count:0},
        		{title:"THE FORTH THING TO DO TODAY",id:_uuid(),count:0},
        		{title:"COMPLETE THE KEYNOTE",id:_uuid(),count:0},
        		{title:"PREPARE PRESENTATION",id:_uuid(),count:0},
        	],
        	doneList:[
                {title:"test",id:_uuid(),count:1},
                {title:"test",id:_uuid(),count:1},
                {title:"test",id:_uuid(),count:2},
                {title:"test",id:_uuid(),count:5},
        	],
        	removeList:[
        	],
            historyList:[
                {title:"test",id:_uuid(),computedTime:new Date(2019,7-1,8).getTime()},
                {title:"test",id:_uuid(),computedTime:new Date(2019,7-1,9).getTime()},
                {title:"test",id:_uuid(),computedTime:new Date(2019,7-1,10).getTime()},
                {title:"test",id:_uuid(),computedTime:new Date(2019,7-1,10).getTime()},
                {title:"test",id:_uuid(),computedTime:new Date(2019,7-1,11).getTime()},
                {title:"test",id:_uuid(),computedTime:new Date(2019,7-1,11).getTime()},
                {title:"test",id:_uuid(),computedTime:new Date(2019,7-1,11).getTime()},
                {title:"test",id:_uuid(),computedTime:new Date(2019,7-1,11).getTime()},
                {title:"test",id:_uuid(),computedTime:new Date(2019,7-1,11).getTime()},
            ],
        	activeID:"",
        	add:false,
        	addText:"",
        	innerPageBool:false,
            innerPageName:"",
        	todoBool:true,
        	doneBool:true,
            week:[],
            today:Date.now(),
        },
        watch:{
        	status:function(val){
        		if(val=="work"){
    				this.stopTiming();
    				this.totalTime = this.times[this.status];
        		}else if(val=="break"){		        			
    				this.stopTiming();
    				this.totalTime = this.times[this.status];
        		}
        	},
        	removeBoxActive:function(){
        		console.log(this.removeList.length,this.removelen)
        		return this.removeList.length!=this.removelen;
        	},
            historyList:{
                handler: function(newVal, oldVal) {                    
                    this.week = this.getWeekData();                    
                },
                deep: true,
            }
        },
        mounted: function() {
        	this.totalTime = this.times[this.status];
        	this.updateActiveID();
            /*this.innerPageBool = true;
            this.innerPageName = "music";*/
            this.week = this.getWeekData(); 
        },
        methods: {
            getWeekData:function(){
                var date01 = new Date();
                date01.setHours(0, 0, 0, 0);
                var max = date01.setDate(date01.getDate()+1);
                var min = date01.setDate(date01.getDate()-7);

                var week = [];
                for(var i=0;i<7;i++){
                    var tempMax = date01.setDate(date01.getDate()+1);
                    var tempMin = tempMax-24*60*60*1000;
                    var date = new Date(tempMin);
                    week.push({
                        date:(date.getMonth()+1)+"/"+date.getDate(),
                        value:0,
                        min:tempMin,
                        max:tempMax
                    });
                }

                for(var temp in this.historyList){
                    var computedTime = this.historyList[temp].computedTime;
                    var index = week.findIndex(function(el){
                        return (computedTime>=el.min)&&(computedTime<el.max);
                    });
                    if(index!=-1){
                        week[index].value++;
                    }

                }
                return week;
            },
        	todoListStart:function(e){
        		this.todoListDrag = true;
        	},
        	todoListEnd:function(e){
        		this.todoListDrag = false;
        		this.removeActive = false;
        	},
        	todoListCheckMove:function(e){
        		this.removeActive = e.to===this.$refs.todoListRemoveBox.$el;
                return true;
        	},
            doneListStart:function(e){
                this.doneListDrag = true;
            },
            doneListEnd:function(e){
                this.doneListDrag = false;
                this.removeActive = false;
            },
            doneListCheckMove:function(e){
                this.removeActive = e.to===this.$refs.doneListRemoveBox.$el;
                return true;
            },
        	updateActiveID:function(){
        		if(this.activeID==""){
        			if(this.todoList.length>0){
        				this.activeID = this.todoList[0].id;
        			}
        		}
        	},
        	clockButton_click:function(){
        		this.playing = !this.playing;
        		if(this.playing){
        			this.startTiming();
        		}else{
        			this.pauseTiming();
        		}
        	},
        	startTiming:function(){
        		this.playing = true;
	        	this.prevTime = Date.now();
	        	this.timeId = setInterval(this.interval, 1000/60);
        	},
        	pauseTiming:function(){
        		this.playing = false;
        		clearInterval(this.timeId);
        	},
        	stopTiming:function(){
        		this.pauseTiming();
        		this.time = 0;
        		this.prevTime = 0;
        	},
        	interval:function(){
    			if(this.time>=this.totalTime){
					if(this.status=="work"){
                        if(this.sound.work!="none"){
                            var sound = this.$refs["sound_"+this.sound.work][0];
                            sound.pause();
                            sound.currentTime = 0;
                            sound.play();
                        }
                        var temp = this.todoList[this.currentlyItemIndex];
                        this.historyList.push({
                            title:temp.title,
                            id:temp.id,
                            computedTime:Date.now()
                        });
                        console.log(this.historyList);
                        alert("work finished");
                        this.todoList[this.currentlyItemIndex].count++;
                        this.status = "break";

					}else if(this.status=="break"){
                        /*if(confirm("將工作設定完成!"))
                        {
                            this.computedItem(this.currentlyItemIndex);
                            this.activeID = "";
                            this.updateActiveID();
                        }*/ 
                        if(this.sound.break!="none"){
                            var sound = this.$refs["sound_"+this.sound.break][0];
                            sound.pause();
                            sound.currentTime = 0;
                            sound.play();
                        }     
                        alert("break finished");    						
						this.status = "work";
					}
    			}else{
                    var temp = Date.now();
                    this.time += (temp - this.prevTime)/1000;
                    this.prevTime = temp;
                }
        	},
        	formatTime:function(time){
        		var temp = Math.ceil(time);
        		var m = ("0"+Math.floor(temp/60)).slice(-2);
        		var s = ("0"+Math.floor(temp%60)).slice(-2);
        		return m+":"+s;
        	},
        	todoListButton_click:function(e,item){
        		this.activeID = item.id;
        		this.status = "work";
        		this.stopTiming();
        		this.totalTime = this.times[this.status];
        	},
        	todoListIcon_click:function(e,item,index){ 
        		if(this.activeID == item.id){
	        		this.status = "work";
                    this.activeID = "";
	        		this.stopTiming();
	        		this.totalTime = this.times[this.status];
	        	}
                this.computedItem(index);
                this.updateActiveID(); 
        	},
            doneListIcon_click:function(e,item,index){
                this.unComputedItem(index);
                this.updateActiveID();
            },
        	addText_click:function(){
        		this.add = true;
        	},
        	inputText_blur:function(){
        		this.add = false;
        	},
        	addButton_click:function(){
        		if(this.addText!==""){
        			this.todoList.push({
	        			title:this.addText,
	        			id:_uuid(),
                        count:0
	        		});
	        		this.addText="";
	        		this.add = false;
	        		this.updateActiveID();
        		}		        		
        	},
        	todo_click:function(){
        		this.todoBool = !this.todoBool;
        	},
        	done_click:function(){
        		this.doneBool = !this.doneBool;
        	},
        	list_click:function(name){
        		this.innerPageBool = true;
                this.innerPageName = name;
        	},
        	closeButton_click:function(){		        		
        		this.innerPageBool = false;
        	},
        	getStrokeDasharray:function(r){
        		return r*2*Math.PI;
        	},
        	getStrokeDashoffset:function(r,rate){
        		return this.getStrokeDasharray(r)*rate;
        	},
            computedItem:function(index){
                if(index!=-1){
                    var temp = this.todoList.splice(index, 1)[0];
                    this.doneList.push({
                        title:temp.title,
                        id:temp.id,
                        count:temp.count
                    });
                }
            },
            unComputedItem:function(index){
                if(index!=-1){
                    var temp = this.doneList.splice(index, 1)[0];
                    this.todoList.push({
                        title:temp.title,
                        id:temp.id,
                        count:temp.count
                    });
                }
            }
        },
        computed:{
        	todoListS:function(){
        		var that = this;
        		function fun01(value) {
        			return (that.activeID!=value.id)/*&&!value.computed*/;
        		}
        		return this.todoList.filter(fun01);
        	},
            currentlyItemIndex:function(){
                var that = this;
                function fun01(value) {
                    return (that.activeID==value.id);
                }
                var index = this.todoList.findIndex(fun01);
                return index;
            },
            currentlyItem:function(){
                var index = this.currentlyItemIndex;
                if(index==-1){
                    return undefined;
                }
                return this.todoList[index];
            },
        	currentlyItemTitle:function(){
        		var temp = this.currentlyItem;                
        		return temp==undefined?"":temp.title;
        	},
            weekValueSum:function(){
                var sum = 0;
                for(var temp in this.week){
                    sum+=this.week[temp].value;
                }
                return sum;
            },
            todayValueSum:function(){
                var len = this.week.length;
                if(len<=0){
                    return 0;
                }
                return this.week[len-1].value;
            },
            timeDateRange:function(){
                function getDateText(date){
                    return date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
                }
                if(this.week.length==0){
                    return "";
                }else{
                    return getDateText(new Date(this.week[0].min))+" - "+getDateText(new Date(this.week[this.week.length-1].min));
                }
            }
        }
    });
}	