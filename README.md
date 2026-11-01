<img src="Dexi.png" style="width: 100px;">
<br>
Bem-vindo ao protótipo de um visualizador de arquivos, links e notas web como um codex de conteúdos que virá a ser um navegador integrado com I.A..

## Uso offline

O Dexi armazena o quadro, as notas e os arquivos importados no armazenamento local do navegador. Para usar a aplicação sem internet, abra-a primeiro uma vez enquanto estiver online e aguarde o carregamento das bibliotecas. O service worker guarda a aplicação e suas dependências para as próximas aberturas.

A aplicação precisa ser servida por HTTP ou HTTPS (por exemplo, em `http://localhost` ou por um servidor HTTPS); abrir o arquivo `index.html` diretamente não permite registrar o service worker. Pesquisa na web, sincronização com o Google Drive, páginas abertas em iframes e conteúdo remoto continuam dependendo de internet. Arquivos e imagens externos só ficam disponíveis offline depois de serem carregados e armazenados pelo navegador.

Para iniciar um servidor local com Python, execute na pasta do projeto:

```bash
python3 -m http.server 8000
```

Depois, abra `http://localhost:8000` no navegador. Mantenha esse servidor local em execução para abrir o app sem internet.