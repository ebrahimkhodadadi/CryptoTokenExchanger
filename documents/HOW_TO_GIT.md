# intro

in this section I want to set some guide lines on how to use git and what commands we need

# git structure

we have 2 main branches 1.main 2.dev and we do development related stuff in dev branch and whenever its ready for production it will tagged with a version and merged with main branch (the production branch) 

## git features and bugfix

in the process of developing we mainly do tow things:
    1. adding new features
    2. fixing bugs

so we have tow kind of branches that come from dev branch 
    1. feature/[name-of-feature]
    2. bugfix/[name-of-bug]

any thing that we add to the project we should consider it as feature (from very small change to the code like adding comments or refactoring small section of code up to adding fully working new "Feature")

and any thing that we do to fix any bug will goes under bugfix branch

Note: these tow branch should only come from dev and merge with dev only

# git commands

## 1. git status

to check what's up in the active repo

## 2. git add [file_name] or git add .

to add file or files to the stage section

## 3. git commit -m 'commit msg'

to commit change

## 4. git log

to see all the commits

## 5 git branch

to see all active branches

## 6 git branch [branch_name]

to create new brach of the current branch

## 7 git checkout [branch_name}

to move branch to the given branch

## 8 git merge [branch_name]

to merge given branch with current branch

# work flow

our work flow in this project should be something like this:

let say we have to add new auth system with google

first we make sure that we are in the dev branch

`git checkout dev`

then we pull dev to have newest code

`git pull origin dev`

then create new branch name 'feature/Oath2-google'

`git branch feature/Oath2-google`

then we make sure that we are in the new branch

`git status` or `git checkout feature/Oath2-google`

after that we do some coding and make some commits

`git add .` and `git commit -m 'msg'`

and always push the code

`git push origin feature/Oath2-google`

when the code finished and new feature added we merge the branch with dev

`git checkout dev` then `git pull origin dev` and then `git merge feature/Oath2-google` 

after merge completed we push the code

`git push origin dev`

