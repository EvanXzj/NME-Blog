'use strict'

const marked = require('marked')
const Post = require('../lib/mongo').Post

var CommentModel = require('./comments')//留言模型

// 给 post 添加留言数 commentsCount
Post.plugin('commentsCount',{
    afterFind:(posts) => {
        return Promise.all(posts.map(function(post){
             return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
                    post.commentsCount = commentsCount
                     return post
             })
        }))
    },
    afterFindOne:(post) => {
        if(post){
            return CommentModel.getCommentsCount(post._id).then(function (count) {
                post.commentsCount = count
                return post
            })
        }
        return post
    }
})

// 将 post 的 content 从 markdown 转换成 html
Post.plugin('contentToHtml',{
    afterFind:(posts) => {
        return posts.map(function(post){
            post.content = marked(post.content)
            return post
        })
    },
    afterFindOne:(post) => {
        if(post){
            post.content = marked(post.content)
        }
        return post
    }
})

module.exports = {
    
    // 创建一篇文章
    create:(post) => {
        return Post.create(post).exec()
    },

    // 通过文章 id 获取一篇文章
    getPostById:(postId) => {
        return Post.findOne({_id:postId}).populate({path:'author',model:'User'})
                   .addCreatedAt().commentsCount().contentToHtml().exec()
    },

    // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
    getPosts:(author) => {
        var query = {}
        if(author){
            query.author = author
        }
        return Post.find(query).populate({ path: 'author', model: 'User' }).sort({_id:-1})
                   .addCreatedAt().commentsCount().contentToHtml().exec()
    },

    // 通过文章 id 给 pv 加 1
    incPv:(postId) => {
        return Post.update({_id:postId},{$inc:{pv:1}}).exec()
    },

    // 通过文章 id 获取一篇原生文章（编辑文章）
    getRowPostById:(postId) => {
        return Post.findOne({_id:postId}).populate({path:'author',model:'User'}).exec()
    },

    // 通过用户 id 和文章 id 更新一篇文章
    updatePostById:(postId,author,data) => {
        return Post.update({author:author,_id:postId},{$set:{content:data}}).exec()
    },

    // 通过用户 id 和文章 id 删除一篇文章
    delPostById:(postId,author) => {
        return Post.remove({author:author,_id:postId}).exec().then(function(res){
             // 文章删除后，再通过文章postId删除该文章下的所有留言
            if (res.result.ok && res.result.n > 0) {
                return CommentModel.delCommentsByPostId(postId)
            }
        })
    }
}