#! /bin/bash

set -e

cd __tests__

for test in $(find . -name "*.test.ts"); do
    echo "running tests in $test"
    ../node_modules/.bin/ts-node $test
done
