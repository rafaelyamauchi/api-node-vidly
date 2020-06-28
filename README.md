#  api Node Vidly

Projeto backend node, um aplicativo locadora video imaginário.

## Getting Started

Essas instruções fornecerão uma cópia do projeto em execução na sua máquina local para fins de desenvolvimento e teste.

### Pre-requisitos

Você primeiro precisa instalar a última versão do MongoDB Community Edtion. 

```
[MongoDB](https://www.mongodb.com/try/download/community)

```

### Intalação

Depois, na pasta no projeto, instale as dependências

```
npm install 
```

Inserir dados no banco de dados.

```
node seed.js 
```


## Rodando os testes

Rode os testes e tenha certeza que está tudo funcionando.

npm test

## Iniciando o servidor

node index.js

Abra o browser e digite o endereço:

http://localhost:3900/api/genres

Você irá ver uma lista dos generos de filmes. O que confirma que você instalou tudo com sucesso.

## Variáveis de ambiente

Se você olhar na pasta config/default.json, irá ver uma propriedade jwtPrivateKey. Esta key essa chave é usada para encryptar JSON web tokens. Para produção, você deve armazenar a chave como uma variável de ambiente.

## Produção

O projeto pode ser colocado em produção no heroku, seguindo as intruções no site.

[Heroku](https://www.heroku.com/#)

## Construido com

* [Mongo Community Server](https://www.mongodb.com/try/download/community) - Banco de dados para aplicações modernas.
* [Node](https://nodejs.org/en/) - É um ambiente de execução javascript baseado motor V8 JavaScript do Chrome.
* [Jest](https://jestjs.io/) - Jest é um poderoso Framework de Testes em JavaScript com um foco na simplicidade.

## Autor

* **Rafael Yamauchi** - *Initial work* - [Linkedin](https://www.linkedin.com/in/rafaelyamauchi/)

## Licença

Este projeto é licenciado sobre MIT Licença - veja em [LICENSE.md](LICENSE.md) para mais detalhes.

## Reconhecimento

* Projeto desenvolvido no curso Node Complete Guide - Mosh Hamedani
