#!/bin/bash

#Variable that holds the tabulation character (avoids errors later in the script)
TAB=$(printf "\t")
#Folder PATH
DIR=$(dirname $1)

#Find total number of columns
num_col=$(head -n 1 $1 | awk '{print NF}')
echo "$num_col columns where detected"
#Number of Taxonomies
num_taxo=$(($num_col - 3))
echo "Assuming $num_taxo Taxonomies present..."
#For each taxonomy
for i in `seq 1 $num_taxo`;
do
    indx=$((3 + $i)) #Index of column
    name=`cut -f $indx $1 | head -n 1`
    echo "Taxonomy "$i":" $name; #extract taxonomy name
    #PIVOT TABLE FOR EACH TAXONOMY (NAME | LENGTH | SUM)
    awk -F'\t' -v var=$indx 'NR>1 {a[$var]++; b[$var]+=$2;} END {for (i in a) {printf ("%s\t%i\t%i\n"),i, a[i], b[i]}}' $1 | sort -t"$TAB" -k 3 -rn > taxonomy.$i.temp
    echo "Writing file taxonomy.$name.temp"
    #Remove special characters and take first 14 letters. Then paste as first column
    paste <(sed "s/[!@#$.,%^&*?\' ]//g" taxonomy.$name.temp | cut -f1 | cut -c1-14) taxonomy.$i.temp > $DIR/taxonomy.$i.tsv
    #Add header in taxonomy file
    sed -i '1i id\tname\tlength\tsum' $DIR/taxonomy.$i.tsv
    rm taxonomy.$i.temp #Remove temporary file
done
