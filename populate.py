"""Simple test schemas."""
import datajoint as dj
connection = dj.conn(host='local-db', user='root', password='labbook')
group1_simple = dj.Schema('test_group1_simple', connection=connection)
group2_simple = dj.Schema('test_group2_simple', connection=connection)
plot1 = dict(data=[dict(x=[1, 2, 3],
                        y=[2, 6, 3],
                        type='scatter',
                        mode='lines+markers',
                        marker=dict(color='red')),
                   dict(type='bar',
                        x=[1, 2, 3],
                        y=[2, 5, 3])],
             layout=dict(title='A Fancy Plot'))
plot2 = dict(data=[dict(x=[1, 2, 3],
                        y=[7, 6, 2],
                        type='scatter',
                        mode='lines+markers',
                        marker=dict(color='purple')),
                   dict(type='bar',
                        x=[1, 2, 3],
                        y=[2, 1, 3])],
             layout=dict(title='A Second Fancy Plot'))
plot3 = dict(data=[dict(x=[1, 2, 3],
                        y=[2, 9, 3],
                        type='scatter',
                        mode='lines+markers',
                        marker=dict(color='blue')),
                   dict(type='bar',
                        x=[1, 2, 3],
                        y=[4, 2, 4])],
             layout=dict(title='A Very Fancy Plot'))
@group1_simple
class TableA(dj.Lookup):
    definition = """
    a_id: int
    ---
    a_name: varchar(30)
    """
    contents = [(0, 'Raphael',), (1, 'Bernie',)]
@group1_simple
class TableB(dj.Lookup):
    definition = """
    -> TableA
    b_id: int
    ---
    b_number: float
    """
    contents = [(0, 10, 22.12), (0, 11, -1.21,), (1, 21, 7.77,),
                (0, 13, 2.13,), (0, 15, -5.22,), (1, 26, 12.33,),
                (0, 19, 3.15,), (0, 22, -3.46,), (1, 24, 15.97,),
                (0, 31, 7.15,), (0, 33, -9.77,), (1, 37, 44.33,)]
@group1_simple
class Mouse(dj.Lookup):
    definition = """
    mouse_id: int
    ---
    mouse_name: varchar(30)
    """
    contents = [(0, 'jeff'), (1, 'splinter'), (2, 'ratman')]
@group1_simple
class MousePlots(dj.Lookup):
    definition = """
    -> Mouse
    plot_id: int
    ---
    plot: longblob
    """
    contents = [(1, 1, plot2), (2, 2, plot3), (0, 0, plot1)]
@group1_simple
class PlotlyTable(dj.Lookup):
    definition = """
    p_id: int
    ---
    plot: longblob
    """
    contents = [(2, plot1)]