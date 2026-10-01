<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Payments: Cashfree production API via src/lib/cashfree.server.ts; credits granted only by fulfill_credit_purchase (service role) after re-fetching the order from Cashfree — never trust return URL or webhook body alone.
- Redesign gating: unlock_project RPC spends one credit per project (idempotent); both redesign and chat server functions call it before AI work.
