DOCKERTAG=`date +"%s"`
echo "Building and deploying emeal/api:$DOCKERTAG"
yarn install && \
yarn build && \
cp ../yarn.lock ./dist/yarn.lock && \
docker build . -t emeal/api:$DOCKERTAG && \
docker push emeal/api:$DOCKERTAG && \
rancher kubectl -n emeal-prod set image deployment/api api=emeal/api:$DOCKERTAG