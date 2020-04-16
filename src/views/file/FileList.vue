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
				<a-breadcrumb-item><a href="" @click.self.prevent="getDataSource('root')">主目录</a></a-breadcrumb-item>
				<a-breadcrumb-item v-for="(path, index) of paths" v-bind:key="index" v-show="index > 0"><a href="" @click.self.prevent="handleBreadcrumb(index)">{{ path }}</a></a-breadcrumb-item>
			</a-breadcrumb>
    </div>
		
		<div class="table-operator operator file-operator">
			<div v-if="selectedRow.length > 0">
				<a-dropdown>
				  <a-menu slot="overlay" @click="handleMenuClick">
					<a-menu-item key="1">上传文件</a-menu-item>
					<a-menu-item key="2">上传文件夹</a-menu-item>
				  </a-menu>
				  <a-button icon="upload"> 上传 <a-icon type="down" /> </a-button>
				</a-dropdown>
				<a-button icon="folder-add" @click="renameVisible = true, cacheRecord = {}">文件夹</a-button>
				<a-button-group>
				  <a-button icon="share-alt">分享</a-button>
				  <a-button icon="download">下载</a-button>
				  <a-button icon="edit">重命名</a-button>
				  <a-button icon="copy">复制到</a-button>
				  <a-button icon="arrow-right">移动到</a-button>
				  <a-button icon="delete">删除</a-button>
				</a-button-group>
			</div>
			<div></div>
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
							@click="rowClick(data,index,$event)"
							@dblclick="rowDblclick(data)" 
							@contextmenu="contextmenu(data,$event)" 
							v-bind:key="data.key"
							v-bind:class="{active:selectedRow.includes(index)}"
						>
							<td class="directory-cell"><span class="file-icon"><a-icon :type="!data.isFolder ? fileIcon(data.mediaType) : 'folder'" /></span><span class="file-name">{{ data.name }}</span></td>
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
		  destroyOnClose
		>
			<Upload :uploadHandler="uploadHandler" :attachOption="{path: paths.join('/')}" :directory="uploadDirectory" :multiple="true"></Upload>
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
		
		<a-modal
		:title="moveOrCopyType === 'move' ? '移动到' : '复制到'"
		:visible="moveOrCopyVisible"
		@cancel="moveOrCopyVisible = false"
		@ok="handleMoveOrCopy"
		>
			<a-directory-tree 
			multiple 
			defaultExpandAll
			 :treeData="treeData"
			 :replaceFields="{children: 'child',title: 'name'}"
			 @select="moveOrCopyClick"
			 >
			</a-directory-tree>
		</a-modal>
		
		<AttachmentPreview 
			ref="attachmentPreview"
			v-if="selectAttachment"
			:attachment="selectAttachment"
			>
		</AttachmentPreview>
		
		<v-contextmenu ref="contextmenu">
			<v-contextmenu-item @click="rowDblclick(cacheRecord)">打开</v-contextmenu-item>
			<v-contextmenu-item>下载</v-contextmenu-item>
			<v-contextmenu-item divider></v-contextmenu-item>
			<v-contextmenu-item>分享</v-contextmenu-item>
			<v-contextmenu-item divider></v-contextmenu-item>
			<v-contextmenu-item @click="moveOrCopyHandle('copy')">复制到</v-contextmenu-item>
			<v-contextmenu-item @click="moveOrCopyHandle('move')">移动到</v-contextmenu-item>
			<!-- <v-contextmenu-item @click="renameVisible = true, cacheRecord = {}">新建文件夹</v-contextmenu-item> -->
			<v-contextmenu-item divider></v-contextmenu-item>
			<v-contextmenu-item @click="renameVisible = true">重命名</v-contextmenu-item>
			<v-contextmenu-item @click="handleDelete">删除</v-contextmenu-item>
		</v-contextmenu>
		</a-card>
	</template>

<script>
import { mixin, mixinDevice } from '@/utils/mixin.js'
import Upload from '@/components/Upload/Upload'
import attachmentApi from '@/api/attachment'
import folder from '@/api/folder'
import AttachmentPreview from '@/views/file/AttachmentPreview'
export default {
  name: 'TableList',
	components: {
		Upload: Upload,
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
				path: 'root'
			},
			localDataSource: [],
			treeData: [],
			selectedRow: [],
			loading: true,
			selectAttachment: {},
			cacheRecord: undefined,
			renameVisible: false,
			renameLoading: false,
			uploadVisible: false,
			uploadDirectory: false,
			moveOrCopyVisible: false,
			moveOrCopyType: '',
			moveOrCopyKey: '',
			uploadHandler: attachmentApi.upload,
			fileIcon: stringType => {
				if (stringType !== undefined && stringType !== null) {
					var mediaType = stringType.split('/')[0]
					/* console.log(mediaType) */
					if (mediaType === 'image') {
						return 'picture'
					} else
					if (mediaType === 'video') {
						return 'play-square'
					} else
					if (mediaType === 'audio') {
						return 'play-circle'
					}
				}
				return 'file'
			}
    }
  },
  methods: {
		moveOrCopyHandle(type) {
			this.moveOrCopyType = type
			folder.getFolderNode().then(res => {
				this.treeData = res
			})
			this.moveOrCopyVisible = true
		},
		handleMenuClick(e) {
			if (e.key === '1') {
				this.uploadVisible = true
				this.uploadDirectory = false
			} else {
				this.uploadDirectory = this.uploadVisible = true
			}
		  console.log('click', e)
		},
		toParentPath() {
			this.getDataSource(this.parentPath)
			this.directoryHistory.splice(this.directoryCursor + 1, this.directoryHistory.length - this.directoryCursor, this.parentPath)
			this.directoryCursor = this.directoryHistory.length - 1
		},
		nextOrPrevious(previous, next) {
			/* console.log(this.directoryCursor)
			console.log(this.directoryHistory) */
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
			this.selectedRow = []
			if (path !== undefined) {
				this.queryParam.path = path
			}
			folder.query(Object.assign(this.queryParam)).then(res => {
				this.localDataSource = res.data.folderSub
				this.paths = Object.assign({}, this.queryParam).path.split('/')
				console.log(this.paths)
				this.parentPath = res.data.parent
				this.loading = false
			}).catch(e => {
				this.loading = false
				this.$notification.error({
					message: '错误提示',
					description: '当前目录不存在或已删除'
				})
			})
		},
		rowClick (record, index, e) {
			// 阻止文本被选择
			window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty()
			if (e.ctrlKey) {
				console.log('ctrlKey')
				var arrIndex = this.selectedRow.indexOf(index)
				if (this.selectedRow.includes(index) && arrIndex > -1) {
					this.selectedRow.splice(arrIndex, 1)
				} else {
					this.selectedRow.push(index)
				}
			} else if (e.shiftKey) {
				if (this.selectedRow[0] < index) {
					for (var i1 = 1; i1 <= index - this.selectedRow[0]; i1++) {
						this.selectedRow.push(this.selectedRow[0] + i1)
					}
					console.log(this.selectedRow)
				}
				if (this.selectedRow[0] > index) {
					for (var i2 = 0; i2 < this.selectedRow[0] - index; i2++) {
						this.selectedRow.push(index + i2)
					}
					console.log(this.selectedRow)
				}
			} else {
				this.selectedRow = []
				this.selectedRow.push(index)
			}
		},
		rowDblclick (record) {
			if (record.isFolder !== undefined & record.isFolder) {
				this.getDataSource(record.path)
				this.directoryHistory.splice(this.directoryCursor + 1, this.directoryHistory.length - this.directoryCursor, this.queryParam.path)
				this.directoryCursor = this.directoryHistory.length - 1
			} else {
				this.selectAttachment = Object.assign({}, record)
			}
		},
		contextmenu (record, event) {
			this.cacheRecord = Object.assign({}, record)
			this.$refs.contextmenu.show({	top: event.pageY, left: event.pageX })
			window.event.returnValue	=	false
			return false
		},
		handleRename() {
			this.renameLoading = true
			var record = this.cacheRecord
			folder.rename({ 'name': record.name, 'key': record.key, 'path': this.queryParam.path, 'isFolder': record.isFolder }).then(res => {
				this.getDataSource()
				this.renameLoading = this.renameVisible = false
			})
		},
		handleDelete() {
			var record = this.cacheRecord
			folder.deleted({ 'key': record.key, 'isFolder': record.isFolder }).then(res => {
				this.getDataSource()
			}).catch(e => {
				this.$notification.error({
					message: '错误提示',
					description: '当前目录下存在文件或文件夹'
				})
			})
		},
		moveOrCopyClick(selectedKeys, info) {
			console.log(info)
			this.moveOrCopyKey = selectedKeys.toString()
		},
		handleMoveOrCopy() {
			if (this.moveOrCopyKey === '') {
				this.$notification.error({
					message: '错误提示',
					description: '请选择目录后再继续操作'
				})
				return
			}
			var keys = []
			for (var i = 0; i < this.selectedRow.length; i++) {
				keys.push(this.localDataSource[this.selectedRow[i]].key)
			}
			if (this.moveOrCopyType === 'move') {
				folder.moveTo({ 'parentKey': this.moveOrCopyKey, 'keys': keys.toString() }).then(res => {
					this.getDataSource()
					this.moveOrCopyVisible = false
				}).catch(e => { console.log(e) })
			} else {
				folder.copyTo({ 'parentKey': this.moveOrCopyKey, 'keys': keys.toString() }).then(res => {
					this.getDataSource()
					this.moveOrCopyVisible = false
				}).catch(e => { console.log(e) })
			}
		},
		// 面包屑导航 点击事件
		handleBreadcrumb(i) {
			this.getDataSource(this.paths.slice(0, i + 1).join('/'))
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
		padding: 12px;
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
		background-color: #f1f3f4;
	}
	
	.directory tbody tr:hover {
		background-color: #f1f3f4;
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
  
  .file-operator {
	height: 25px;
	display: flex;
	justify-content: space-between;
  }
	
	.file-operator > div > .ant-btn{
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
