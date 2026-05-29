const express = require('express');
const db = require('../data/database');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const produtos = await db.fetchAll('produtos', '*', 'nome');
    res.json(produtos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const produto = await db.fetchById('produtos', req.params.id);
    res.json(produto);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { nome, preco, descricao, categoria_id, imagem } = req.body;
    if (!nome || preco === undefined) {
      return res.status(400).json({ error: 'Os campos nome e preco são obrigatórios.' });
    }

    const [novoProduto] = await db.insert('produtos', [{ nome, preco, descricao, categoria_id, imagem }]);
    res.status(201).json(novoProduto);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nome, preco, descricao, categoria_id, imagem } = req.body;
    const [produtoAtualizado] = await db.update('produtos', req.params.id, {
      nome,
      preco,
      descricao,
      categoria_id,
      imagem,
    });
    res.json(produtoAtualizado);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [produtoRemovido] = await db.remove('produtos', req.params.id);
    res.json(produtoRemovido);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
