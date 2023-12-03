Frontend [Visualisations- Recommender & Insights]
To host locally
    -Navigate to the source folder: CSE-6242-DVA-MSD
    -run python -m http.server 8000
    -Then open a web browser at http://localhost:8000/


Backend [Dataset, Model Training and Evaluation]
- run `cd model`.
You can install the following libraries: h5py, pandas, scikit-learn, tqdm. However we can't gurantee if it will run successfully. Hence before you run any of the model scripts we recommend setting up a virtual environment or a conda environment and install requirements.txt packages.
Guide to setup virtual environment: https://docs.python.org/3/library/venv.html
    - run `pip3 install -r requirements.txt`
Guide to setup conda environment: https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#activating-an-environment
    - install pip in conda: https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#using-pip-in-an-environment
    - run `pip3 install -r requirements.txt`

    Dataset Wrangling [Optional]
        - model/dataset.ipynb includes the steps to download and get the desired dataset for the UI and the model training.
        - This script is optional. We have already included the files necessary to run the model.
        - The purpose of inclusing this is to show how we aggregated data from an old messy collection of datasets with different file formats and sizes.

    Model
        - model/model.ipynb includes the steps to evaluate and train the model. It compares our method against SOTA.

#########################################################################################################
