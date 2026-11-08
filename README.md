# Planner de Concurso

Site estático para o GitHub Pages. Todo o conteúdo vem do arquivo `edital.json`.

## Publicar o site
1. Crie um repositório no GitHub e envie estes arquivos (`index.html`, `style.css`, `app.js`, `edital.json`).
2. Em Settings > Pages, escolha a branch `main` e a pasta `/ (root)`.
3. O endereço do site aparece na mesma tela.

## Editar
- **Pela tela:** clique em Editar, altere os textos (títulos, tópicos, horários), adicione ou remova itens e clique em Concluir edição. As alterações ficam salvas no navegador.
- **Publicar:** clique em Publicar no GitHub e informe usuário, repositório e um token. O site grava o `edital.json` no repositório. Depois, no computador: `git pull`.
- **Pelo JSON:** edite o `edital.json` direto no GitHub ou no seu computador e faça `git push`.
- Sem token: use Copiar JSON ou Baixar JSON e cole o conteúdo no `edital.json` do repositório.

## Token
Crie em GitHub > Settings > Developer settings > Fine-grained tokens, com acesso só a este repositório e permissão Contents: Read and write. O token fica apenas no navegador de quem publicou. O site e o `edital.json` são públicos para quem tiver o link, então não coloque dados pessoais.

## Marcações
As caixas de teoria, questões e revisões ficam salvas no navegador. Para guardá-las no repositório, use Publicar no GitHub.
