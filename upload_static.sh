#!/bin/bash

set -ex

for file in $( find ./static -type f ); do
	NAME=$(echo "$file" | cut -d/ -f2-)
	wrangler kv:key put --binding image_flipper_site $NAME "$(cat $file)"
done
