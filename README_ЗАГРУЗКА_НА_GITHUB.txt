КАК ЗАГРУЖАТЬ В GITHUB

1. Загружай в репозиторий все основные файлы и папки:
   - src
   - public
   - index.html
   - package.json
   - tsconfig.json
   - vite.config.ts
   - README.md

2. ВАЖНО ПРО ПАПКУ GITHUB ACTIONS:
   Для работы GitHub Pages папка должна называться строго:
   .github/workflows/deploy.yml

   На Mac папка .github скрытая. Поэтому в архиве дополнительно есть видимая папка:
   github/workflows/deploy.yml

   Если ты не видишь скрытую папку .github, сделай так:
   - В GitHub нажми Add file → Create new file
   - В имя файла вставь: .github/workflows/deploy.yml
   - Открой файл из видимой папки github/workflows/deploy.yml
   - Скопируй весь код и вставь в GitHub
   - Нажми Commit changes

3. В GitHub Pages:
   Settings → Pages → Source: GitHub Actions

4. Репозиторий должен быть Public, если не хочешь платить за GitHub Pages.

5. После зеленой галочки в Actions сайт откроется здесь:
   https://pokemonzhukovsky.github.io/reklamastroy-designer/
