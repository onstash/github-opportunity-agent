# Python Learning Note: VS Code Interpreter RCA

## Problem

VS Code was showing Python import issues even though the package installation was correct inside the project.

In particular, `pydantic` looked like it was not available from the editor, even though it was installed and importable from the `uv` environment.

## What was verified first

This command worked:

```bash
uv run python -c "import pydantic; print(pydantic.__version__)"
```

It returned:

```text
2.13.4
```

That proved:

- `uv` was working
- the project environment was valid
- `pydantic` was installed
- the problem was not dependency installation

## Root cause

VS Code was using the wrong Python interpreter.

It was pointing at a base Python managed by `uv`, something like:

```text
~/.local/share/uv/python/cpython-3.13.5-macos-aarch64-none/bin/python3.13
```

That interpreter is not the same as the project virtual environment.

The correct interpreter for this project is:

```text
apps/python-agent/.venv/bin/python
```

That file is the project virtual environment's Python executable.

## Why this was confusing

The project virtual environment Python is a symlink back to the `uv`-managed base interpreter.

So both of these can appear related:

- `~/.local/share/uv/python/...`
- `apps/python-agent/.venv/bin/python`

But they are not interchangeable in VS Code.

The important difference is:

- `~/.local/share/uv/python/...` = base interpreter
- `apps/python-agent/.venv/bin/python` = project environment with project packages

VS Code needs the project environment path, not just the underlying base Python.

## Fixes attempted

### Attempt 1: Verify package installation

We verified that `pydantic` was installed by running:

```bash
uv run python -c "import pydantic; print(pydantic.__version__)"
```

### Why it did not fix the issue

This only proved the environment worked from the terminal.
It did not change what interpreter VS Code had selected.

### Attempt 2: Use the interpreter picker without selecting the exact executable

There was confusion in the VS Code interpreter flow because `Enter interpreter path...` can lead to a file chooser.

### Why it did not fix the issue

The key detail is that VS Code expects the actual Python executable file, not just the folder containing it.

Selecting the wrong item keeps VS Code attached to the wrong interpreter.

## Final fix

In VS Code:

1. Open `Python: Select Interpreter`
2. Choose `Enter interpreter path...`
3. Choose `Find...`
4. Select the exact file:

```text
/Users/santoshvenkatraman/Personal/Coding/github-opportunity-agent/apps/python-agent/.venv/bin/python
```

After that, the editor started working correctly.

## Practical takeaway

When terminal commands work but VS Code still shows missing imports:

- do not assume the package is missing
- first check which interpreter VS Code selected
- for `uv` projects, prefer the project `.venv/bin/python`
- do not select `/usr/bin/python3`, `/usr/local/bin/python3`, or the raw `~/.local/share/uv/python/...` base interpreter

## Good interpreter for this project

```text
/Users/santoshvenkatraman/Personal/Coding/github-opportunity-agent/apps/python-agent/.venv/bin/python
```

## Bad interpreter examples for this project

```text
/usr/local/bin/python3
/usr/bin/python3
~/.local/share/uv/python/cpython-3.13.5-macos-aarch64-none/bin/python3.13
```

## Optional prevention

To reduce this happening again, add a VS Code workspace setting such as:

```json
{
  "python.defaultInterpreterPath": "/Users/santoshvenkatraman/Personal/Coding/github-opportunity-agent/apps/python-agent/.venv/bin/python"
}
```
