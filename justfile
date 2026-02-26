image := "briqueparbrique-jekyll"

# Construire l'image Docker
build-image:
    docker build -t {{image}} .

# Lancer Jekyll en local avec rechargement automatique
serve: build-image
    docker run --rm -it -v "{{justfile_directory()}}:/srv/jekyll" -p 4000:4000 -p 35729:35729 {{image}}

# Builder le site
build: build-image
    docker run --rm -v "{{justfile_directory()}}:/srv/jekyll" {{image}} bundle exec jekyll build

# Nettoyer le dossier _site
clean:
    rm -rf _site .jekyll-cache .jekyll-metadata
