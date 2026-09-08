# LangChain Agent Tutorial

A small LangChain tutorial that builds a web-search agent using a local Ollama language model and Tavily Search. The main walkthrough is in [research/agent_demo.ipynb](research/agent_demo.ipynb).

The agent can:

- Run a local model through Ollama.
- Search the web with Tavily.
- Pull the public `hwchase17/react` prompt through LangSmith.
- Use the ReAct agent pattern to combine the model and search tool.

## Requirements

- Windows, macOS, or Linux
- Python 3.13
- Conda
- Ollama
- A Tavily API key
- A LangSmith API key if the public prompt cannot be pulled anonymously in your environment

The example uses the Ollama model `gemma4:e4b`. You can use another locally installed model by changing the `model` value in the notebook.

## Setup

Create and activate the Conda environment:

```powershell
conda create -n langagent python=3.13 -y
conda activate langagent
```

Install the project dependencies:

```powershell
python -m pip install -r requirements.txt
```

Install and start Ollama, then download the model used by the notebook:

```powershell
ollama pull gemma4:e4b
```

Confirm that the model is available:

```powershell
ollama list
```

Register the environment as a Jupyter kernel:

```powershell
python -m ipykernel install --user --name langagent --display-name "Python (langagent)"
```

## Environment Variables

Create a `.env` file in the project root. At minimum, add your Tavily key:

```text
TAVILY_API_KEY=your_tavily_api_key
```

The notebook also reads these optional LangSmith variables when configured:

```text
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=langchain-tutorial
```

`OPENAI_API_KEY` is still read by the current setup code for compatibility with earlier versions of the tutorial, but the active model is Ollama and does not require an OpenAI key.

Do not commit `.env` or any API keys to source control.

## Run the Notebook

Open [research/agent_demo.ipynb](research/agent_demo.ipynb) in VS Code or Jupyter and select the `Python (langagent)` kernel. Run the cells from top to bottom.

The notebook will:

1. Configure the environment and certificates.
2. Create a Tavily search tool.
3. Initialize the local Ollama model.
4. Pull the ReAct prompt.
5. Build a `create_react_agent` and `AgentExecutor`.
6. Ask the agent to research a current topic and summarize the result.

The prompt cell intentionally acknowledges that the public prompt contains serialized content:

```python
from langsmith import Client

client = Client()
prompt = client.pull_prompt(
	"hwchase17/react",
	dangerously_pull_public_prompt=True,
)
```

Only use this option when you trust the prompt source. The public prompt must also be reachable over the network.

## Troubleshooting

### Ollama connection refused

Start the Ollama service and confirm that it is listening on its default port:

```powershell
ollama serve
ollama list
```

The default Ollama API address is `http://localhost:11434`.

### `No module named langchain_core.memory`

The tutorial uses the pre-1.0 LangChain agent API. Keep the LangChain packages in the same version family by installing from `requirements.txt`. After changing packages, restart the notebook kernel.

### `ModuleNotFoundError: No module named langchain_ollama`

Install the project requirements in the same environment selected by the notebook:

```powershell
conda activate langagent
python -m pip install -r requirements.txt
```

### Public prompt pull is blocked

The notebook uses the LangSmith client with `dangerously_pull_public_prompt=True`. Configure LangSmith credentials in `.env` if the request requires authentication, and only pull prompts you trust.

## Project Structure

```text
.
|-- app.py
|-- requirements.txt
|-- README.md
`-- research/
	`-- agent_demo.ipynb
```

`app.py` currently contains shared imports and environment setup for future script-based work. The complete agent walkthrough is in the notebook.

## License

No license has been specified for this tutorial repository.
