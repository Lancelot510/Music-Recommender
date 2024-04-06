Demo Video: https://www.youtube.com/watch?v=ut1pPZzLBZM
GitHub Repo: https:https://github.gatech.edu/abhalerao9/Music-Recommender
Hosted URL [Just for reference, please host locally]: https://github.gatech.edu/pages/abhalerao9/Music-Recommender/ 

#########################################################################################################

Frontend [Visualisations- Recommender & Insights]
To host locally
    -Navigate to the source folder: CSE-6242-DVA-MSD
    -run python -m http.server 8000
    -Then open a web browser at http://localhost:8000/

#########################################################################################################

Backend [Dataset Wrangling, Model Training and Evaluation]
- run `cd model`.
You can install the following libraries independently: h5py, pandas, scikit-learn, tqdm; but we STRONGLY recommend 
before you run any of the model scripts set up a virtual environment or a conda environment and install requirements.txt packages.
Guide to setup virtual environment: https://docs.python.org/3/library/venv.html
    - run `pip3 install -r requirements.txt`
Guide to setup conda environment: https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#activating-an-environment
    - install pip in conda: https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#using-pip-in-an-environment
    - run `pip3 install -r requirements.txt`

Make sure you select the venv environment when running cells inside the notebook.

    Dataset Wrangling [Optional]
        - model/dataset.ipynb includes the steps to download and get the desired dataset for the UI and the model training.
        - This script is optional. We have already included the files necessary to run the model.
        - The purpose of inclusing this is to show how we aggregated data from an old messy collection of datasets with different file formats and sizes.

    Model Training and Evaluation
        - model/model.ipynb includes the steps to evaluate and train the model. It compares our method against SOTA.
