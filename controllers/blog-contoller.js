import { v4 as uuidv4 } from 'uuid';

export const getBlogs = async (req, res, next) =>{
    const pool = req.db;
    let blogs, totalBlogs;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;

    try {
        const totalResult = await pool.query('SELECT COUNT(*) FROM "Blog"');
        totalBlogs = parseInt(totalResult.rows[0].count);
        const offset = (page - 1) * limit;

        const blogQuery = await pool.query(
            'SELECT * FROM "Blog" ORDER BY title DESC OFFSET $1 LIMIT $2',
            [offset, limit]
        );

        blogs = blogQuery.rows;
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }

    if (!blogs){
        return res.status(404).json({message: "No blogs found"});
    }

    return res.status(200).json({ blogs, totalBlogs });
}

export const getBlog = async (req, res, next) =>{
    const pool = req.db;
    const blogId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM "Blog" WHERE id = $1', [blogId]);
        const blog = result.rows[0];
    
        if (!blog) {
          return res.status(404).json({ message: 'Blog not found' });
        }
    
        return res.status(200).json({ blog });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


export const addBlog = async (req, res, next) => {
    const pool = req.db;
    const {title, description, user} = req.body;

    try {
        // Check if the user exists by ID
        const existingUser = await pool.query('SELECT id FROM "User" WHERE id = $1', [user]);
        if (existingUser.rows.length === 0) {
          return res.status(400).json({ message: 'Unable to find user' });
        }

        const id = uuidv4();
    
        // Insert the blog entry into the "blogs" table
        const blogQuery = await pool.query(
          'INSERT INTO "Blog" (id, title, description, "user") VALUES ($1, $2, $3, $4) RETURNING *',
          [id, title, description, user]
        );
    
        const blog = blogQuery.rows[0];
    
        return res.status(201).json({ blog });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateBlog = async (req, res, next) =>{
    const pool = req.db;
    const {title, description, image} = req.body;
    const blogId = req.params.id;

    try {
        const updateQuery = await pool.query(
          'UPDATE "Blog" SET title = $1, description = $2 WHERE id = $3 RETURNING *',
          [title, description, blogId]
        );
    
        const updatedBlog = updateQuery.rows[0];
    
        if (!updatedBlog) {
          return res.status(500).json({ message: 'Unable to update' });
        }
    
        return res.status(200).json({ blog: updatedBlog });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
      }
}   

export const deleteBlog = async (req, res, next) =>{
    const pool = req.db;
    const blogId = req.params.id;
    try {
        const existingBlog = await pool.query('SELECT id, "user" FROM "Blog" WHERE id = $1', [blogId]);
    
        if (existingBlog.rows.length === 0) {
          return res.status(404).json({ message: 'Blog not found' });
        }
    
        const blog = existingBlog.rows[0];
        
        await pool.query('DELETE FROM "Blog" WHERE id = $1', [blogId]);
    
        return res.status(200).json({ message: 'Delete Successful' });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
      }
}   

export const getUserBlogs = async (req, res, next) => {
    const pool = req.db;
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const offset = (page - 1) * limit;

    try {
        const existingUser = await pool.query('SELECT id FROM "User" WHERE id = $1', [userId]);
        if (existingUser.rows.length === 0) {
          return res.status(400).json({ message: 'Unable to find user' });
        }
    
        const blogsQuery = await pool.query(
          'SELECT * FROM "Blog" WHERE "user" = $1 LIMIT $2 OFFSET $3',
          [userId, limit, offset]
        );
    
        const totalBlogsQuery = await pool.query('SELECT COUNT(*) FROM "Blog" WHERE "user" = $1', [userId]);
    
        const userBlogs = blogsQuery.rows;
        const totalBlogs = parseInt(totalBlogsQuery.rows[0].count);
    
        return res.status(200).json({ userBlogs, totalBlogs });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
