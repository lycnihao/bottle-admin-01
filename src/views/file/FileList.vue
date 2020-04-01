<template>
  <a-card :bordered="false">
		
    <div class="table-page-search-wrapper operator">
			<div class="file-path-tools">
				<a-button shape="circle" icon="arrow-left" :class="{disable:directoryCursor == 0}" @click="nextOrPrevious(true,false)"/>
				<a-button shape="circle" icon="arrow-up" :class="{disable:parentPath == null}" @click="toParentPath"/>
				<a-button shape="circle" icon="arrow-right" :class="{disable:directoryCursor + 1 >= directoryHistory.length}" @click="nextOrPrevious(false,true)" />
				<a-button shape="circle" icon="redo" @click="getDataSource(directoryHistory[directoryCursor])" :loading="loading"/>
			</div>
      <a-breadcrumb class="file-path">
				<a-breadcrumb-item><a href="" @click.self.prevent="getDataSource('/')">主目录</a></a-breadcrumb-item>
				<a-breadcrumb-item v-for="(path, index) of paths" v-bind:key="index"><a href="" @click.self.prevent="handleBreadcrumb(index)">{{ path }}</a></a-breadcrumb-item>
			</a-breadcrumb>
    </div>
		
		<div class="table-operator operator file-operator">
		  <a-button icon="upload" @click="uploadVisible = true">上传</a-button>
			<a-button icon="folder-add" @click="renameVisible = true, cacheRecord = {}">文件夹</a-button>
		  <a-dropdown>
		    <a-menu slot="overlay">
		      <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
		      <!-- lock | unlock -->
		      <a-menu-item key="2"><a-icon type="lock" />锁定</a-menu-item>
		    </a-menu>
		    <a-button style="margin-left: 8px">
		      更多 <a-icon type="down" />
		    </a-button>
		  </a-dropdown>
		</div>
		
		<a-spin :spinning="loading">
			<a-icon slot="indicator" type="loading" style="font-size: 24px" spin />
			<table class="directory" ref="directory">
				<thead>
					<tr>
						<th class="directory-cell directory-head-cell">名称</th>
						<th class="directory-cell directory-head-cell">大小</th>
						<th class="directory-cell directory-head-cell">日期</th>
					</tr>
				</thead>
					<tbody>
						<tr 
							v-for="(data, index) in localDataSource"
							@click="rowClick(data,index)"
							@dblclick="rowDblclick(data)" 
							@contextmenu="contextmenu(data,$event)" 
							v-bind:key="data.key" 
							v-bind:class="{ 'active' : data.active }"
						>
							<td class="directory-cell"><span class="file-icon"><a-icon :type="fileIcon(data.mediaType)" /></span><span class="file-name">{{ data.name }}</span></td>
							<td class="directory-cell">{{ data.size | fileSizeFormat }}</td>
							<td class="directory-cell">{{ data.createTime | moment }}</td>
						</tr>
					</tbody>
			</table>
		</a-spin>
		
		<a-modal
		  title="上传附件"
		  v-model="uploadVisible"
		  :footer="null"
		  :afterClose="onUploadClose"
		  destroyOnClose
		>
		  <FilePondUpload
		    ref="upload"
				:path="paths.join('/')"
		    :uploadHandler="uploadHandler"
		  ></FilePondUpload>
		</a-modal>
		
		<a-modal
      title="重命名文件夹"
      :visible="renameVisible"
      @ok="handleRename"
      :confirmLoading="renameLoading"
      @cancel="renameVisible = false"
    >
      <a-input size="large" placeholder="文件名称" v-if="renameVisible" v-model="cacheRecord.name" />
    </a-modal>
		
		<AttachmentPreview 
			ref="attachmentPreview"
			v-if="selectAttachment"
			:attachment="selectAttachment"
			>
		</AttachmentPreview>
		
		<v-contextmenu ref="contextmenu">
			<v-contextmenu-item @click="renameVisible = true, cacheRecord = {}">新建文件夹</v-contextmenu-item>
			<v-contextmenu-item @click="renameVisible = true">重命名</v-contextmenu-item>
			<v-contextmenu-item @click="handleDelete">删除</v-contextmenu-item>
		</v-contextmenu>
		</a-card>
	</template>

<script>
import { mixin, mixinDevice } from '@/utils/mixin.js'
import FilePondUpload from '@/components/Upload/FilePondUpload'
import attachmentApi from '@/api/attachment'
import directoryApi from '@/api/directory'
import AttachmentPreview from '@/views/file/AttachmentPreview'
export default {
  name: 'TableList',
	components: {
		FilePondUpload:	FilePondUpload,
		AttachmentPreview: AttachmentPreview
	},
	mixins: [mixin, mixinDevice],
	mounted ()	{
		this.getDataSource()
		this.directoryHistory.push(this.queryParam.path)
	},
  data () {
    return {
			directoryHistory: [],
			directoryCursor: 0,
			paths: [],
			parentPath: '',
      queryParam: {
				path: ''
			},
			localDataSource: [],
			selectedRowKeys: [],
			loading: true,
			selectAttachment: {},
			cacheRecord: undefined,
			renameVisible: false,
			renameLoading: false,
			uploadVisible: false,
			uploadHandler: attachmentApi.upload,
			fileIcon: stringType => {
				if (stringType !== undefined) {
					var mediaType = stringType.split('/')[0]
					console.log(mediaType)
					if (mediaType === 'image') {
						return 'picture'
					}
					if (mediaType === 'video') {
						return 'play-square'
					}
				}
				return 'folder'
			}
    }
  },
  methods: {
		toParentPath() {
			this.getDataSource(this.parentPath)
			this.directoryHistory.splice(this.directoryCursor + 1, this.directoryHistory.length - this.directoryCursor, this.parentPath)
			this.directoryCursor = this.directoryHistory.length - 1
		},
		nextOrPrevious(previous, next) {
			console.log(this.directoryCursor)
			console.log(this.directoryHistory)
			if (previous && this.directoryHistory.length >= this.directoryCursor - 1 && this.directoryCursor > 0) { 
				this.getDataSource(this.directoryHistory[this.directoryCursor - 1])
				this.directoryCursor--
			}
			if (next && this.directoryCursor + 1 < this.directoryHistory.length) {
				this.getDataSource(this.directoryHistory[this.directoryCursor + 1])
				this.directoryCursor++
			}
		},
		getDataSource(path) {
			this.loading = true
			if (path !== undefined) {
				this.queryParam.path = path
			}
			directoryApi.query(Object.assign(this.queryParam)).then(res => {
				this.localDataSource = []
				for (var d = 0; d < res.data.directoryList.length; d++) {
					var itemD = res.data.directoryList[d]
					itemD.fileKey = itemD.id
					itemD.isDirectory = true
					itemD.active = false
					this.localDataSource.push(itemD)
				}
				
				for (var a = 0; a < res.data.attachmentList.length; a++) {
					var itemA = res.data.attachmentList[a]
					itemA.active = false
					this.localDataSource.push(itemA)
				}
				this.paths = Object.assign({}, this.queryParam).path.split('/').slice(1)
				this.parentPath = res.data.parent
				this.loading = false
			})
		},
		rowClick (record, index) {
			record.active = true
		},
		rowDblclick (record) {
			if (record.isDirectory !== undefined & record.isDirectory) {
				this.getDataSource(record.path)
				this.directoryHistory.splice(this.directoryCursor + 1, this.directoryHistory.length - this.directoryCursor, this.queryParam.path)
				this.directoryCursor = this.directoryHistory.length - 1
			} else {
				this.selectAttachment = Object.assign({}, record)
			}
		},
		contextmenu (record, event) {
			this.cacheRecord = Object.assign({}, record)
			this.$refs.contextmenu.show({	top: event.clientY,	left: event.clientX	})
			window.event.returnValue	=	false
			return false
		},
		handleRename() {
			this.renameLoading = true
			var record = this.cacheRecord
			directoryApi.rename({ 'name': record.name, 'key': record.fileKey, 'path': this.queryParam.path, 'isDirectory': record.isDirectory }).then(res => {
				this.getDataSource()
				this.renameLoading = this.renameVisible = false
			})
		},
		handleDelete() {
			var record = this.cacheRecord
			directoryApi.deleted({ 'key': record.fileKey, 'isDirectory': record.isDirectory }).then(res => {
				this.getDataSource()
			}).catch(e => {
				this.$notification.error({
					message: '错误提示',
					description: '当前目录下存在文件或文件夹'
				})
			})
		},
		handleBreadcrumb(i) {
			this.getDataSource('/' + this.paths.slice(0, i + 1).join('/'))
		},
		onUploadClose() {
			this.$refs.upload.handleClearFileList()
		}
  },
	watch: {
		uploadVisible: function(newValue, oldValue) {
		  this.getDataSource()
		}
	}
}
</script>

<style lang="less" scoped>
	.directory {
		width: 100%;
    display: table;
    border-spacing: 0;
    border-collapse: collapse;
	}
	
	.directory-cell {
		display: table-cell;
    padding: 16px;
    font-size: 0.875rem;
    text-align: left;
    font-weight: 400;
    line-height: 1.43;
    border-bottom: 1px solid rgba(224, 224, 224, 1);
    letter-spacing: 0.01071em;
    vertical-align: inherit;
	}
	
	.directory-head-cell {
		color: rgba(0, 0, 0, 0.87);
    font-weight: 500;
    line-height: 1.5rem;
	}
	
	.directory tbody tr.active {
		background-color: #f5f7fa;
	}
	
	.directory tbody tr:hover {
		background-color: #f5f7fa;
	}
	
	
	
	.editable-row-operations a {
    margin-right: 8px;
  }
  .search {
    margin-bottom: 54px;
  }

  .fold {
    width: calc(100% - 216px);
    display: inline-block
  }

  .operator {
    margin-bottom: 18px;
  }
	
	.file-operator > .ant-btn{
		margin-right: 8px;
	}
	
	.file-path-tools {
		position: absolute;
	}
	
	.file-path-tools button{
		font-size: 14px;
		border: 1px solid transparent;
	}
	
	.file-path-tools button:hover {
	  background-color: #f8f8f8;
	}
	
	.file-path-tools .disable {
		color: #ccc;
	}
	
	.file-path-tools .disable::after {
		opacity: 0;
	}
	
	.file-path-tools .disable:hover {
		background-color: #fff;
	}
	
	.file-path {
		margin-left: 150px;
		background-color: #f1f3f4;
		border-radius: 14px;
		padding: 5px 5px 5px 10px;
	}
	
	.file-icon {
		margin-right: 8px;
		font-size: 18px
	}
	
	.file-name {
		cursor: pointer
	}
	
  @media screen and (max-width: 900px) {
    .fold {
      width: 100%;
    }
  }
</style>
