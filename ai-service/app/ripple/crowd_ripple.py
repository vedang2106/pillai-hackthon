"""
Crowd Ripple Engine for EventFlow AI
Uses NetworkX to simulate spatial crowd propagation across connected city/venue nodes over time.
"""

from typing import Dict, Any, List
import networkx as nx

def simulate_crowd_ripple(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Builds a directional spatial graph of zones/nodes and calculates ripple congestion waves over +5m, +10m, +15m intervals.
    
    nodes format:
      [{"id": "zone1", "name": "Station X", "type": "RAIL", "currentOccupancy": 5000, "capacity": 6000}, ...]
    edges format:
      [{"source": "zone1", "target": "zone2", "weight": 1.0, "travelTimeMin": 5}, ...]
    """
    G = nx.DiGraph()
    
    node_lookup = {}
    for n in nodes:
        nid = str(n.get("id") or n.get("_id", ""))
        if not nid:
            continue
        G.add_node(
            nid,
            name=n.get("name", nid),
            type=n.get("type", "ZONE"),
            occupancy=float(n.get("currentOccupancy", 0)),
            capacity=float(max(n.get("capacity", 1000), 1))
        )
        node_lookup[nid] = n
        
    for e in edges:
        src = str(e.get("source"))
        tgt = str(e.get("target"))
        tt = float(e.get("travelTimeMin", 5))
        if G.has_node(src) and G.has_node(tgt):
            G.add_edge(src, tgt, weight=tt)

    # Simulation stages: CURRENT, +5 MIN, +10 MIN, +15 MIN
    timeline = {}
    intervals = [0, 5, 10, 15]
    
    # Calculate base state at interval 0
    state = {}
    for n in G.nodes():
        occ = G.nodes[n]["occupancy"]
        cap = G.nodes[n]["capacity"]
        util = min(occ / cap, 1.0)
        state[n] = {
            "nodeId": n,
            "name": G.nodes[n]["name"],
            "type": G.nodes[n]["type"],
            "occupancy": int(occ),
            "capacity": int(cap),
            "utilization": round(util * 100, 1),
            "risk": "CRITICAL" if util >= 0.9 else ("HIGH" if util >= 0.75 else ("MEDIUM" if util >= 0.6 else "LOW"))
        }
    timeline["CURRENT"] = state
    
    # Propagate pressure along outgoing edges for +5m, +10m, +15m
    for idx, t in enumerate([5, 10, 15], start=1):
        prev_key = "CURRENT" if idx == 1 else f"+{intervals[idx-1]} MIN"
        prev_state = timeline[prev_key]
        next_state = {}
        
        for n in G.nodes():
            cap = G.nodes[n]["capacity"]
            prev_occ = prev_state[n]["occupancy"]
            
            # Outflow to neighbors
            out_neighbors = list(G.successors(n))
            in_neighbors = list(G.predecessors(n))
            
            incoming_surge = 0.0
            for p in in_neighbors:
                p_occ = prev_state[p]["occupancy"]
                p_cap = prev_state[p]["capacity"]
                # High density nodes push 10-15% of crowd to successors
                if (p_occ / p_cap) > 0.6:
                    transfer = p_occ * 0.12 / max(len(list(G.successors(p))), 1)
                    incoming_surge += transfer
                    
            new_occ = max(0.0, prev_occ * 0.90 + incoming_surge) # 10% natural dispersal, + incoming
            util = min(new_occ / cap, 1.0)
            
            next_state[n] = {
                "nodeId": n,
                "name": G.nodes[n]["name"],
                "type": G.nodes[n]["type"],
                "occupancy": int(new_occ),
                "capacity": int(cap),
                "utilization": round(util * 100, 1),
                "risk": "CRITICAL" if util >= 0.9 else ("HIGH" if util >= 0.75 else ("MEDIUM" if util >= 0.6 else "LOW"))
            }
            
        timeline[f"+{t} MIN"] = next_state
        
    return {
        "timeline": timeline,
        "nodesCount": G.number_of_nodes(),
        "edgesCount": G.number_of_edges(),
        "source": "AI_PREDICTION"
    }
