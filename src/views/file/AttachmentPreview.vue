<template>
	<div>
		<a-modal
		style="top: 20px;"
		  v-model="videoPreviewVisible"
			:footer="null"
			:maskClosable="false"
			:maskStyle="{'background-color':'rgba(0, 0, 0, 0)'}"
			wrapClassName="dplayer-modal"
			destroyOnClose
			:closable="false"
			centered
		>
			<div class="dplayer-header" @mousedown="move">
				<div class="dplayer-header-title">视频播放</div>
				<div class="dplayer-close" @click="videoPreviewVisible = false">
					<a-icon type="close" />
				</div>
			</div>
			<div class="dplayer-body">
				<d-player
				  ref="player"
				  :options="videoOptions"
				  v-show="videoPreviewVisible"
				  class="video-player-box"
				  style="width: 100%;"
				>
				</d-player>
			</div>
		</a-modal>
		<a-modal
		style="top: 20px;"
		  v-model="audioPreviewVisible"
			:footer="null"
			:maskClosable="false"
			:maskStyle="{'background-color':'rgba(0, 0, 0, 0)'}"
			wrapClassName="dplayer-modal"
			destroyOnClose
			:closable="false"
			centered
		>
			<div class="dplayer-header" @mousedown="move">
				<div class="dplayer-header-title">音频播放</div>
				<div class="dplayer-close" @click="audioPreviewVisible = false">
					<a-icon type="close" />
				</div>
			</div>
			<div class="dplayer-body">
				<audio :src="audioOptions.url" controls="controls" style="width: 100%;background-color: #f1f3f4;margin-bottom: -5px;"></audio>
			</div>
		</a-modal>
	</div>
</template>

<script>
import 'vue-dplayer/dist/vue-dplayer.css'
import VueDPlayer from 'vue-dplayer'
import 'viewerjs/dist/viewer.css'
import Viewer from 'viewerjs'


export default {
	name: 'AttachmentPreview',
	components: {
		'd-player': VueDPlayer
	},
	props: {
	  attachment: {
	    type: Object,
	    required: true
	  },
		visible: {
		  type: Boolean,
		  required: false,
		  default: true
		}
	},
	data () {
		return {
			photo: {},
			previewLoading: true,
			photoPreviewVisible: false,
			videoPreviewVisible: false,
			audioPreviewVisible: false,
			nonsupportPreviewVisible: false,
			player: {},
			audioOptions: {
				url: ''
			},
			videoOptions: {
			  lang: 'zh-cn',
			  video: {
			    url: '',
			    type: 'auto'
			  }
			}
		}
	},
	watch: {
		visible: function(newValue, oldValue) {
		  /* this.$log.debug('old value', oldValue)
		  this.$log.debug('new value', newValue) */
		  if (newValue) {
		    this.loadSkeleton()
		  }
		},
	  attachment: function(newValue, oldValue) {
	    if (newValue) {
	      var attachment = newValue
	      this.handleJudgeMediaType(attachment)
	    }
	  },
		photoPreviewVisible: function(newValue, oldValue) {
			this.showViewer(this, this.photoPreviewVisible)
		}
	},
	methods: {
		showViewer(that, photoPreviewVisible) {
			if (photoPreviewVisible) {
				var image = new Image()
				image.src = this.attachment.path
				var viewer = new Viewer(image, {
					navbar: false,
					hidden() {
						viewer.destroy()
						that.photoPreviewVisible = !photoPreviewVisible
					}
				})
				viewer.show()
			}
		},
		move(e) {
			 // 获取目标元素
			const odiv = e.target.parentElement.parentElement
			// 算出鼠标相对元素的位置
			const disX = e.clientX - odiv.offsetLeft
			const disY = e.clientY - odiv.offsetTop
			// 鼠标按下并移动的事件
			document.onmousemove = (e) => {       
					// 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
					const left = e.clientX - disX
					const top = e.clientY - disY
					
					// 绑定元素位置到positionX和positionY上面
					this.positionX = top
					this.positionY = left
					
					// 移动当前元素
					odiv.style.left = left + 'px'
					odiv.style.top = top + 'px'
			}
			document.onmouseup = (e) => {
					document.onmousemove = null
					document.onmouseup = null
			}
		},
		loadSkeleton() {
		  this.previewLoading = true
		  setTimeout(() => {
		    this.previewLoading = false
		  }, 500)
		},
		handleJudgeMediaType(attachment) {
		  var mediaType = attachment.mediaType
		  // 判断文件类型
		  if (mediaType) {
		    var prefix = mediaType.split('/')[0]
		    if (prefix === 'video' || prefix === 'flv') {
		      // 控制各个组件的显示
		      this.handlePreviewVisible(false, true, false, false)
		
		      // 去除视频地址后面的参数
		      var lastIndex = attachment.path.lastIndexOf('?')
		      var path = attachment.path.substring(0, lastIndex === -1 ? attachment.path.lenght : lastIndex)
		      // 设置视频地址
		      this.$set(this.videoOptions.video, 'url', path)
		      /* this.$log.debug('video url', path) */
					console.log('video url:' + path)
		    } else if (prefix === 'image') {
		      this.handlePreviewVisible(true, false, false, false)
		    } else if (prefix === 'audio') {
		      this.handlePreviewVisible(false, false, true, false)
					this.$set(this.audioOptions, 'url', attachment.path)
		    } else {
		      this.handlePreviewVisible(false, false, false, true)
		    }
		  }
		},
		handlePreviewVisible(photo, video, audio, nonsupport) {
		  // 为了更好的使vue监听到组件变化及时刷新,方式修改组件后需要刷新才能显示一下部分
		  this.$set(this, 'photoPreviewVisible', photo)
		  this.$set(this, 'videoPreviewVisible', video)
			this.$set(this, 'audioPreviewVisible', audio)
		  this.$set(this, 'nonsupportPreviewVisible', nonsupport)
		}
	}
}
</script>

<style>
	
	.draggable-wrap {
		/* position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0; */
	}	
	
	.dplayer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 30px;
		color: #808695;
    background-color: #1e1e1e;
	}
	
	.dplayer-header .dplayer-header-title {
		font-size: 13px;
		padding-left: 12px;
	}
	
	.dplayer-header .dplayer-close {
		display: inherit;
	  width: 45px;
	  height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.dplayer-header .dplayer-close:hover {
		color: #fff;
    background-color: red;
	}
	
	.dplayer-modal .ant-modal-body {
		padding: 0;
		border-radius: 3px;
	}
		
	
</style>
