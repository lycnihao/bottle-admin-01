<template>
  <div>
    <a-upload-dragger
      v-if="draggable"
      :name="name"
	  :directory="directory"
      :multiple="multiple"
      :accept="accept"
      :customRequest="handleUpload"
      :remove="handleRemove"
      @change="handleChange"
    >
      <slot
        role="button"
        class="ant-upload ant-upload-btn"
      />
	  点击选择文件或将文件拖拽到此处
    </a-upload-dragger>
    <a-upload
      v-else
      :name="name"
	  :directory="directory"
      :multiple="multiple"
      :accept="accept"
      :customRequest="handleUpload"
      :remove="handleRemove"
      @change="handleChange"
    >
      <slot />
    </a-upload>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Upload',
  props: {
    name: {
      type: String,
      required: false,
      default: 'file'
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    draggable: {
      type: Boolean,
      required: false,
      default: true
    },
    accept: {
      type: String,
      required: false,
      default: ''
    },
	directory: {
	  type: Boolean,
	  required: false,
	  default: true
	},
	attachOption: {
	  type: Object,
	  required: false,
	  default: function () {
        return { path: 'root/' }
      }
	},
    uploadHandler: {
      type: Function,
      required: true
    }
  },
  methods: {
    handleChange(info) {
      this.$emit('change', info)
    },
    handleRemove(file) {
      this.$emit('remove', file)
    },
    handleUpload(option) {
      const CancelToken = axios.CancelToken
      const source = CancelToken.source()

      const data = new FormData()
      data.append(this.name, option.file)
	  data.append('path', this.attachOption.path)

      this.uploadHandler(
        data,
        progressEvent => {
          if (progressEvent.total > 0) {
            progressEvent.percent = (progressEvent.loaded / progressEvent.total) * 100
          }
		  console.log('Uploading percent: ' + progressEvent.percent)
          option.onProgress(progressEvent)
        },
        source.token,
        option.file
      )
        .then(response => {
          console.log('Uploaded successfully', response)
          option.onSuccess(response, option.file)
          this.$emit('success', response, option.file)
        })
        .catch(error => {
          console.log('Failed to upload file', error)
          option.onError(error, error.response)
          this.$emit('failure', error, option.file)
        })
      return {
        abort: () => {
          console.log('Upload operation aborted by the user')
          source.cancel('Upload operation canceled by the user.')
        }
      }
    }
  }
}
</script>

<style>
</style>
