import streamlit as st


class DashPY:
    def __init__(self) -> None:
        pass

    def text(self,txt):
        st.write(txt)


    def image(self,img):
        st.image(img)

    def headers(self,txt):
        st.sidebar.header(txt)

    def markdown(self,txt):
        st.markdown(txt)

    def legend(self,txt):
        st.caption(txt)




    

def main():
    dash = DashPY()

    pessoas = [{
        "nome":"Pedro",
        "idade": 25,

    }, 
        {"nome":"Victor",
        "idade": 25,}
    ]

main()