import express from "express"
import fs from "node:fs"
import 'dotenv/config'

const app = express();
app.use(express.json());

const PORT = process.env.API_PORT ?? 3000;
const ADRESS = process.env.API_BASE_ADRESS ?? 'localhost';
const JSON_DIR_NAME = process.env.JSON_DIR_NAME;


app.get('/', (req, res) => {
    try {
        res.status(200).json({mensagem:'API em desenvolvimento, tente /tasks.'});
    } catch (err) {
        console.log(err);
    }
})


app.get('/tasks', async (req, res) => {

    const retornaPromise = (url) => {
        return new Promise ((resolve) => {
            fs.readFile(url, {}, (err, data) => {
            const parseData = JSON.parse(data);
            resolve(parseData);
            }); 
        });
    }

    const data = await retornaPromise(JSON_DIR_NAME);
    res.status(200).json(data);
});


app.get('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const verifyId = [];

    const retornaPromise = (url) => {
        return new Promise ((resolve) => {
            fs.readFile(url, {}, (err, data) => {
                const parseData = JSON.parse(data);
                resolve(parseData);
            });
        });
    };

    const data = await retornaPromise(JSON_DIR_NAME);

    for (const item of data) {
        verifyId.push(item.task_id);
    };

    if (verifyId.includes(parseInt(id))) {
        const index = data.findIndex((item) => item.task_id === parseInt(id))
        console.log(index)
        res.status(200).json(data[index]);
    } else {
        res.status(404).json({mensagem : 'id não encontrado'});
    };
});

// Há de ser editado
app.post('/tasks', async (req, res) => {
    const sucessJson = {mensagem:'Tarefa adicionada!'}
    const {task_id, title, description, status} = req.body

    const retornaPromise = (url) => {

        return new Promise (async (resolve, reject) => {

            let arquivoEstadoAtual = await fs.promises.readFile(url, 'utf-8');
            arquivoEstadoAtual = JSON.parse(arquivoEstadoAtual);
            
            arquivoEstadoAtual.push(
                {
                    "task_id": task_id,
                    "title": title,
                    "description": description,
                    "status": status
                }
            );

            resolve(arquivoEstadoAtual)
        });
    };


    const atualizaArquivo = await retornaPromise(JSON_DIR_NAME)

    if (!task_id || !title || !description || !status) {
        res.status(400).json({mensagem:"Todos os parametros são necessários"})
    } else {

        fs.writeFile(JSON_DIR_NAME, JSON.stringify(atualizaArquivo, null, 2), {
            flag: 'w'
        }, (err) => {
            if (err) {
                console.log(err)
            };
        });
    
        res.status(201).json(sucessJson);
    };
});


app.put('/task/:id', (req, res) => {

});








app.listen(PORT, ADRESS, () => console.log(`Running at http://${ADRESS}:${PORT}`));