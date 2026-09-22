export async function createPost(req, res) {
    const article = req.body;
    try {
        await res.json({ message: 'post created', article });
    } catch (err) {
        return res.sendStatus(403);
    }
}

export function getArticle(req, res) {
    const articles = [];
    res.json(articles);
}

export function articlesUpdate(req, res) {
    const { id } = req.params;
    res.json(req.body);
}

export function articlesDelete(req, res) {
    const { id } = req.params;
    res.json({ deleted: id });
}

export function userCommentsGet(req, res) {
    const { articleId } = req.params;
    const comments = [];
    res.json(comments);
}

export const articleController = {
    createPost,
    getArticle,
    articlesUpdate,
    articlesDelete,
    userCommentsGet,
};
