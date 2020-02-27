# Deploy Checklist Template

### Rationale

Recently, I finished Atul Gawande's excellent book *The Checklist Manifesto*. When we think of checklists, we often picture the reductionist, dehumanizing, soul-sucking protocols of bureaucracy--or at the very least, one more inconvenient piece of paper to fill out. 

However, Gawande eloquently argues in his book that when checklists are done well, they can free specialists from having to think about the basics, empowering them to turn their focus on  higher-level issues in their work. This is especially the case in complex fields such as aviation and construction, where checklists have been embraced for decades, as well as medicine and programming, where checklists have yet to become the norm.

While reflecting on the book, I realized that writing deploy tickets at my job is a perfect example of a process that would benefit from a checklist. Many variables--deploy version, rollback version, prod deploy date, stage deploy date, etc.--need to be exactly correct or else major problems can occur. By utilizing a checklist while writing deploy tickets, my team and I can free ourselves to focus on the more complicated, nuanced problems we deal with every day as developers.

### How It Works

To use the checklist, run `node index.js` in your terminal. The program uses `inquirer` to gather the necessary information about which apps will be deployed, which versions of those apps should be deployed, when they should be deployed, and other details. It then creates a short, minimalist checklist to assist the creation of a deploy ticket for each app.
