import express, { json } from "express"
import fs from "node:fs"
import 'dotenv/config'
import { isUtf8 } from "node:buffer";

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

    let listaTarefas = await fs.promises.readFile(JSON_DIR_NAME, 'utf-8');
    listaTarefas = JSON.parse(listaTarefas)

    res.status(200).json(listaTarefas);
});


app.get('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const verifyId = [];

    let listaTarefas = await fs.promises.readFile(JSON_DIR_NAME, 'utf-8');
    listaTarefas = JSON.parse(listaTarefas);

    for (const item of listaTarefas) {
        verifyId.push(item.task_id);
    };

    if (verifyId.includes(parseInt(id))) {
        const index = listaTarefas.findIndex((item) => item.task_id === parseInt(id))
        res.status(200).json(listaTarefas[index]);
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


app.put('/tasks/:id', async (req, res) => {
    const {task_id, title, description, status} = req.body;
    const id = req.params.id;

    if (!task_id || !title || !description || !status) {
        res.status(400).json({mensagem: "Algo deu errado. Verifique se todos os parametros estão sendo enviados!"})
    } else {
        let listaTarefas = await fs.promises.readFile(JSON_DIR_NAME, 'utf-8');
        listaTarefas = JSON.parse(listaTarefas);
    
        const indice = listaTarefas.findIndex((item) => item['task_id'] === parseInt(id))
        if (indice === -1) {
            res.status(404).json({mensagem: "Algo não funcionou como o esperado, tente um outro id."});
        } else {
            listaTarefas[indice] = {
                "task_id": task_id,
                "title": title,
                "description": description,
                "status": status
            }

            fs.writeFile(JSON_DIR_NAME, JSON.stringify(listaTarefas, null, 2), {
                flag: 'w'
            }, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    res.status(200).json({mensagem:'Sucesso, arquivo devidamente editado!'})
                }
            })

        }
    }

});

app.delete('/tasks/:id', async (req, res) => {
    const id = req.params.id;

    let listaTarefas = await fs.promises.readFile(JSON_DIR_NAME, 'utf-8')
    listaTarefas = JSON.parse(listaTarefas)

    const index = listaTarefas.findIndex((item) => item["task_id"] === parseInt(id))
    let lista = [...listaTarefas]
    lista.splice(index, 1)
    
    fs.writeFile(JSON_DIR_NAME, JSON.stringify(lista, null, 2), {
        flag : "w"
    }, (err) => {
        if (err) {
            console.log(err)
        } else {
            res.status(200).json({mensagem:'Sucesso, item deletado'})
        }
    })
})






app.listen(PORT, ADRESS, () => console.log(`Running at http://${ADRESS}:${PORT}`));