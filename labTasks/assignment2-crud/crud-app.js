$(document).ready(function() {
    
    var posts = [];
    var isEditMode = false;
    var currentEditId = null;
    var nextId = 1;
    
    loadPosts();
    
    $('#showFormBtn').on('click', function() {
        isEditMode = false;
        currentEditId = null;
        $('#formTitle').text('Add New Post');
        $('#postForm')[0].reset();
        $('#postId').val('');
        $('#formSection').show();
    });
    
    $('#cancelBtn').on('click', function() {
        $('#formSection').hide();
    });
    
    $('#refreshBtn').on('click', function() {
        loadPosts();
    });
    
    $('#postForm').on('submit', function(e) {
        e.preventDefault();
        
        var postData = {
            id: parseInt($('#postId').val()) || nextId++,
            title: $('#postTitle').val(),
            body: $('#postBody').val()
        };
        
        if (isEditMode) {
            updatePost(currentEditId, postData);
        } else {
            createPost(postData);
        }
    });
    
    $(document).on('click', '.editBtn', function() {
        var postId = $(this).data('id');
        editPost(postId);
    });
    
    $(document).on('click', '.deleteBtn', function() {
        var postId = $(this).data('id');
        var postTitle = $(this).data('title');
        
        if (confirm('Are you sure you want to delete: "' + postTitle + '"?')) {
            deletePost(postId);
        }
    });
    
    function loadPosts() {
        $('#postsList').html('<p style="text-align: center; padding: 20px;">Loading...</p>');
        
        $.ajax({
            url: 'https://jsonplaceholder.typicode.com/posts',
            method: 'GET',
            success: function(apiPosts) {
                if (posts.length === 0) {
                    posts = apiPosts.slice(0, 6);
                    nextId = posts.length + 1;
                }
                displayPosts(posts);
            },
            error: function() {
                if (posts.length === 0) {
                    $('#postsList').html('<div class="alert alert-danger">Error loading posts. Please try again.</div>');
                } else {
                    displayPosts(posts);
                }
            }
        });
    }
    
    function displayPosts(postArray) {
        var html = '';
        
        if (postArray.length === 0) {
            html = '<p style="text-align: center; padding: 20px;">No posts available. Create your first post!</p>';
        } else {
            for (var i = 0; i < postArray.length; i++) {
                var post = postArray[i];
                html += '<div class="card mb-3">';
                html += '<div class="card-body">';
                html += '<div class="row">';
                html += '<div class="col-md-2">';
                html += '<p class="mb-0"><strong>Post ID:</strong></p>';
                html += '<p class="mb-3">' + post.id + '</p>';
                html += '</div>';
                html += '<div class="col-md-8">';
                html += '<p class="mb-1"><strong>' + post.title + '</strong></p>';
                html += '<p class="mb-1">' + post.body + '</p>';
                html += '</div>';
                html += '<div class="col-md-2">';
                html += '<button class="btn btn-sm btn-warning editBtn" data-id="' + post.id + '">Edit</button> ';
                html += '<button class="btn btn-sm btn-danger deleteBtn" data-id="' + post.id + '" data-title="' + post.title + '">Delete</button>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
            }
        }
        
        $('#postsList').html(html);
    }
    
    function createPost(postData) {
        postData.id = nextId++;
        posts.push(postData);
        $('#formSection').hide();
        alert('Post created successfully!');
        displayPosts(posts);
    }
    
    function editPost(postId) {
        var post = posts.find(function(p) {
            return p.id == postId;
        });
        
        if (post) {
            isEditMode = true;
            currentEditId = postId;
            $('#formTitle').text('Edit Post');
            $('#postId').val(post.id);
            $('#postTitle').val(post.title);
            $('#postBody').val(post.body);
            $('#formSection').show();
        }
    }
    
    function updatePost(postId, postData) {
        var index = posts.findIndex(function(p) {
            return p.id == postId;
        });
        
        if (index !== -1) {
            posts[index] = postData;
            $('#formSection').hide();
            alert('Post updated successfully!');
            displayPosts(posts);
        }
    }
    
    function deletePost(postId) {
        posts = posts.filter(function(p) {
            return p.id != postId;
        });
        alert('Post deleted successfully!');
        displayPosts(posts);
    }
    
});

