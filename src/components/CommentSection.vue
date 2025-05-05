<template>
  <div class="comment-section">
    <h3>评论 ({{ comments.length }})</h3>
    
    <!-- 评论输入框 -->
    <div class="comment-input" v-if="isLoggedIn">
      <el-input
        v-model="newComment"
        type="textarea"
        :rows="2"
        placeholder="发表你的评论..."
        maxlength="500"
        show-word-limit
      />
      <el-button type="primary" @click="submitComment" :loading="isSubmitting" :disabled="!newComment.trim()">
        发送评论
      </el-button>
    </div>
    <div v-else class="login-prompt">
      <el-alert
        title="登录后才能发表评论"
        type="info"
        show-icon
        :closable="false"
      />
    </div>
    
    <!-- 评论列表 -->
    <div class="comment-list" v-if="comments.length > 0">
      <el-timeline>
        <el-timeline-item
          v-for="comment in comments"
          :key="comment.id"
          :timestamp="formatDate(comment.createdAt)"
          placement="top"
        >
          <div class="comment-item">
            <div class="comment-user">
              <!-- 移除头像，只保留用户信息 -->
              <div class="comment-user-info">
                <div class="comment-username">{{ comment.nickname || comment.username }}</div>
              </div>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-actions">
              <!-- 点赞和删除按钮都放在右边 -->
              <div class="action-buttons">
                <!-- 点赞按钮 -->
                <el-button 
                  :type="comment.liked ? 'primary' : 'default'" 
                  size="small" 
                  text
                  @click="toggleLike(comment)"
                  :disabled="!isLoggedIn"
                >
                  <div class="like-btn">
                    <span class="material-symbols-outlined like-icon">{{ comment.liked ? 'thumb_up' : 'thumb_up_off_alt' }}</span>
                    <span>{{ comment.likeCount || 0 }}</span>
                  </div>
                </el-button>
                
                <!-- 删除按钮 -->
                <el-button 
                  v-if="canDelete(comment)" 
                  size="small" 
                  type="danger" 
                  text 
                  @click="deleteComment(comment.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
    <div v-else class="no-comments">
      <el-empty description="暂无评论" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import CommentAPI from '../api/comment-api';

export default {
  name: 'CommentSection',
  props: {
    contentType: {
      type: String,
      required: true,
      validator: (value) => ['song', 'album', 'artist', 'playlist'].includes(value)
    },
    contentId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const comments = ref([]);
    const newComment = ref('');
    const isSubmitting = ref(false);
    const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
    
    // 检查用户是否登录
    const isLoggedIn = computed(() => {
      return localStorage.getItem('token') !== null;
    });
    
    // 获取当前用户信息
    const getCurrentUser = () => {
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    };
    
    // 判断是否可以删除评论（自己的评论或管理员）
    const canDelete = (comment) => {
      if (!isLoggedIn.value) return false;
      
      const currentUser = getCurrentUser();
      if (!currentUser) return false;
      
      return comment.userId === currentUser.id || 
             currentUser.role === 'admin';
    };
    
    // 加载评论
    const loadComments = async () => {
      try {
        const response = await CommentAPI.getComments(props.contentType, props.contentId);
        comments.value = response.data;
      } catch (error) {
        console.error('加载评论失败:', error);
        ElMessage.error('加载评论失败，请稍后再试');
      }
    };
    
    // 提交评论
    const submitComment = async () => {
      if (!newComment.value.trim()) return;
      
      isSubmitting.value = true;
      try {
        await CommentAPI.addComment({
          contentType: props.contentType,
          contentId: props.contentId,
          content: newComment.value.trim()
        });
        
        newComment.value = '';
        await loadComments(); // 重新加载评论
        ElMessage.success('评论发表成功');
      } catch (error) {
        console.error('提交评论失败:', error);
        ElMessage.error('评论发表失败，请稍后再试');
      } finally {
        isSubmitting.value = false;
      }
    };
    
    // 删除评论
    const deleteComment = async (commentId) => {
      try {
        await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await CommentAPI.deleteComment(commentId);
        await loadComments(); // 重新加载评论
        ElMessage.success('评论已删除');
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除评论失败:', error);
          ElMessage.error('删除评论失败，请稍后再试');
        }
      }
    };
    
    // 点赞/取消点赞评论
    const toggleLike = async (comment) => {
      if (!isLoggedIn.value) {
        ElMessage.warning('请先登录再点赞');
        return;
      }
      
      try {
        if (comment.liked) {
          // 取消点赞
          const response = await CommentAPI.unlikeComment(comment.id);
          comment.liked = false;
          comment.likeCount = response.data.likeCount;
        } else {
          // 点赞
          const response = await CommentAPI.likeComment(comment.id);
          comment.liked = true;
          comment.likeCount = response.data.likeCount;
        }
      } catch (error) {
        console.error('点赞操作失败:', error);
        ElMessage.error('点赞操作失败，请稍后再试');
      }
    };
    
    // 删除相对时间方法，只保留日期格式化方法
    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return dateString;
      }
    };
    
    // 组件挂载时加载评论
    onMounted(() => {
      loadComments();
    });
    
    return {
      comments,
      newComment,
      isSubmitting,
      isLoggedIn,
      defaultAvatar,
      submitComment,
      deleteComment,
      toggleLike,
      formatDate,
      canDelete
    };
  }
};
</script>

<style scoped>
.comment-section {
  margin-top: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.comment-input {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
}

.comment-input .el-button {
  margin-top: 8px;
  align-self: flex-end;
}

.login-prompt {
  margin: 16px 0;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  padding: 12px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comment-user {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-user-info {
  margin-left: 0; /* 移除头像后不需要左边距 */
}

.comment-username {
  font-weight: bold;
  font-size: 14px;
}

.comment-content {
  margin: 8px 0;
  line-height: 1.5;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  justify-content: flex-end; /* 改为右对齐 */
  align-items: center;
  margin-top: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px; /* 按钮之间的间距 */
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-icon {
  font-size: 16px;
}

.no-comments {
  margin: 20px 0;
  text-align: center;
}
</style> 