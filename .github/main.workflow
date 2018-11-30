workflow "Tests" {
  on = "push"
  resolves = ["yarn"]
}

action "yarn" {
  uses = "yarn"
  runs = "test-all"
}
